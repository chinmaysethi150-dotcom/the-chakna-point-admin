const firebaseConfig = {
  apiKey: "AIzaSyDMBWthbJXYQgFajXqC56NM0jyYS5i9JRk",
  authDomain: "the-chakna-point.firebaseapp.com",
  projectId: "the-chakna-point",
  storageBucket: "the-chakna-point.firebasestorage.app",
  messagingSenderId: "364742522195",
  appId: "1:364742522195:web:c38935e8f142a6d5a91da6",
  measurementId: "G-XLZ1452CQ7"
};
firebase.initializeApp(firebaseConfig);
const auth=firebase.auth(), db=firebase.firestore();
const $=id=>document.getElementById(id);
const ADMIN_EMAIL=""; // Optional extra UI lock. Firestore rules are the real security layer.
let productsUnsub=null, ordersUnsub=null;

const money=n=>"₹"+Number(n||0).toFixed(0);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const dateText=ts=>ts?.toDate?ts.toDate().toLocaleString("en-IN"): "Just now";

$("loginBtn").onclick=async()=>{
  $("loginMsg").textContent="";
  try{
    await auth.signInWithEmailAndPassword($("email").value.trim(),$("password").value);
  }catch(e){ $("loginMsg").textContent=e.message; }
};
$("logoutBtn").onclick=()=>auth.signOut();

auth.onAuthStateChanged(user=>{
  if(!user){
    $("loginView").classList.remove("hidden"); $("appView").classList.add("hidden"); $("logoutBtn").classList.add("hidden");
    if(ordersUnsub) ordersUnsub(); if(productsUnsub) productsUnsub();
    return;
  }
  $("loginView").classList.add("hidden"); $("appView").classList.remove("hidden"); $("logoutBtn").classList.remove("hidden");
  watchOrders(); watchProducts();
});

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  $("ordersTab").classList.toggle("hidden",b.dataset.tab!=="orders");
  $("productsTab").classList.toggle("hidden",b.dataset.tab!=="products");
});

function watchOrders(){
  if(ordersUnsub) ordersUnsub();
  ordersUnsub=db.collection("orders").orderBy("createdAt","desc").limit(100).onSnapshot(s=>{
    $("orderCount").textContent=s.size;
    $("orders").innerHTML=s.empty?'<div class="empty">No orders yet.</div>':s.docs.map(d=>orderCard(d.id,d.data())).join("");
  },e=>$("orders").innerHTML='<div class="error">Orders error: '+esc(e.message)+'</div>');
}
function orderCard(id,o){
  const items=(o.items||[]).map(i=>`<li>${esc(i.name)} × ${i.qty} — ${money(i.price*i.qty)}</li>`).join("");
  const status=o.status||"New";
  return `<article class="card order">
    <div class="row between"><h3>Order #${esc(id.slice(-6).toUpperCase())}</h3><span class="status">${esc(status)}</span></div>
    <b>${esc(o.name||"Customer")}</b>
    <div class="muted">${esc(o.address||"No address")}</div>
    <ul>${items}</ul>
    <div class="totals"><span>Subtotal</span><b>${money(o.subtotal)}</b></div>
    <div class="totals"><span>Delivery</span><b>${money(o.deliveryCharge)}</b></div>
    <div class="totals total"><span>Total</span><b>${money(o.total)}</b></div>
    <div class="muted">Payment: ${esc(o.payment||"COD")} · ${esc(o.paymentStatus||"Pending")} · ${dateText(o.createdAt)}</div>
    <select onchange="changeStatus('${id}',this.value)">
      ${["New","Accepted","Preparing","Ready","Delivered","Cancelled"].map(x=>`<option ${x===status?"selected":""}>${x}</option>`).join("")}
    </select>
  </article>`;
}
window.changeStatus=async(id,status)=>{
  try{await db.collection("orders").doc(id).update({status,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});}
  catch(e){alert(e.message)}
};

$("newProductBtn").onclick=()=>openProduct();
$("cancelProductBtn").onclick=()=>openProduct(false);
function openProduct(show=true,data=null,id=""){
  $("productForm").classList.toggle("hidden",!show);
  if(!show)return;
  $("formTitle").textContent=id?"Edit Product":"Add Product";
  $("editId").value=id; $("pName").value=data?.name||""; $("pPrice").value=data?.price??"";
  $("pCategory").value=data?.category||""; $("pPhoto").value=data?.photo||"";
  $("pAvailable").checked=data?.available!==false;
}
$("saveProductBtn").onclick=async()=>{
  const name=$("pName").value.trim(), price=Number($("pPrice").value);
  if(!name || !Number.isFinite(price)) return alert("Name aur price bharna zaroori hai.");
  const data={name,price,category:$("pCategory").value.trim()||"General",photo:$("pPhoto").value.trim(),available:$("pAvailable").checked,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  try{
    const id=$("editId").value;
    if(id) await db.collection("products").doc(id).update(data);
    else await db.collection("products").add({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    openProduct(false);
  }catch(e){alert(e.message)}
};
function watchProducts(){
  if(productsUnsub) productsUnsub();
  productsUnsub=db.collection("products").orderBy("name").onSnapshot(s=>{
    $("products").innerHTML=s.empty?'<div class="empty">No products. Add your first product.</div>':s.docs.map(d=>{
      const p=d.data();
      return `<article class="card product">
        ${p.photo?`<img src="${esc(p.photo)}" onerror="this.style.display='none'">`:""}
        <div><h3>${esc(p.name)}</h3><b>${money(p.price)}</b><div class="muted">${esc(p.category||"General")} · ${p.available===false?"Unavailable":"Available"}</div></div>
        <div class="row"><button onclick='editProduct(${JSON.stringify(d.id)},${JSON.stringify(p)})'>Edit</button><button class="danger" onclick="deleteProduct('${d.id}')">Delete</button></div>
      </article>`;
    }).join("");
  },e=>$("products").innerHTML='<div class="error">Products error: '+esc(e.message)+'</div>');
}
window.editProduct=(id,p)=>openProduct(true,p,id);
window.deleteProduct=async id=>{
  if(!confirm("Delete this product?"))return;
  try{await db.collection("products").doc(id).delete()}catch(e){alert(e.message)}
};
