(async () => {
  "use strict";
  const categories={
    cleaning:{name:"Cleaning & Housekeeping",folder:"cleaning-housekeeping"},
    plastic:{name:"Plastic Household Items",folder:"plastic-household-items"},
    storage:{name:"Storage & Organisation",folder:"storage-organisation"},
    furniture:{name:"Chairs & Furniture",folder:"chairs-furniture"},
    kitchen:{name:"Kitchen & Dining",folder:"kitchen-dining"},
    bathroom:{name:"Bathroom Accessories",folder:"bathroom-accessories"},
    other:{name:"Other Household Products",folder:"other-household-products"}
  };
  async function getFolderImages(path){
    try{
      const response=await fetch("https://api.github.com/repos/ayushyt69/rahul-housekeeping-/contents/"+path+"?ref=main",{headers:{Accept:"application/vnd.github+json"},cache:"no-store"});
      if(!response.ok)throw new Error("Product photo folder unavailable: "+path);
      const files=await response.json();
      return files.filter(file=>file.type==="file"&&/\\.(jpe?g|png|webp|gif)$/i.test(file.name))
        .sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:"base"}))
        .map(file=>({name:file.name,src:file.download_url,path}));
    }catch(error){console.warn("Could not load product photos from "+path,error);return [];}
  }
  const categoryImages={};
  await Promise.all(Object.entries(categories).map(async([key,category])=>{
    categoryImages[key]=await getFolderImages("product-images/"+category.folder);
  }));
  // Keep the original root-level photos available in All Products while new uploads
  // are automatically grouped by the category folder they are placed in.
  const rootImages=await getFolderImages("product-images");
  const allImages=[...rootImages,...Object.values(categoryImages).flat()];
  const grid=document.getElementById("catalogue-grid"),empty=document.getElementById("catalogue-empty");
  const title=document.getElementById("catalogue-current-title"),count=document.getElementById("catalogue-count");
  const buttons=[...document.querySelectorAll("[data-category]")];
  async function getImages(){
    try{
      const response=await fetch("https://api.github.com/repos/ayushyt69/rahul-housekeeping-/contents/product-images?ref=main",{headers:{Accept:"application/vnd.github+json"},cache:"no-store"});
      if(!response.ok)throw new Error("Product photo folder unavailable");
      const files=await response.json();
      return files.filter(file=>file.type==="file"&&/\.(jpe?g|png|webp|gif)$/i.test(file.name))
        .sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:"base"}))
        .map(file=>({name:file.name,src:file.download_url})).filter(file=>file.src);
    }catch(error){console.warn("Could not load product photos.",error);return [];}
  }
  const allImages=await getImages();let visibleImages=[];
  function render(category){
    const selected=category==="all"?allImages:(categoryImages[category]||[]);
    visibleImages=selected;title.textContent=category==="all"?"All Products":categories[category].name;
    count.textContent=selected.length?selected.length+" photos":"";
    grid.innerHTML=selected.map((image,index)=>'<article class="catalogue-product-card"><button class="catalogue-product-open" type="button" data-image-index="'+index+'" aria-label="Open product photo '+(index+1)+'"><img src="'+image.src+'" alt="Rahul Housekeeping product photograph '+(index+1)+'" loading="lazy"></button></article>').join("");
    empty.hidden=selected.length>0;
    const heading=empty.querySelector("h3"),message=empty.querySelector("p");
    if(category==="all"&&!allImages.length){heading.textContent="Product photos are temporarily unavailable";message.textContent="Please try again later or call us to enquire about products.";}
    else if(category!=="all"){heading.textContent="Photos coming soon";message.textContent="Product photos for this category will be added here. Call us if you need help checking availability.";}
  }
  buttons.forEach(button=>button.addEventListener("click",()=>{
    buttons.forEach(item=>{const active=item===button;item.classList.toggle("is-active",active);item.setAttribute("aria-pressed",String(active));});
    render(button.dataset.category);
  }));
  const viewer=document.createElement("div");viewer.className="photo-viewer";viewer.hidden=true;
  viewer.setAttribute("role","dialog");viewer.setAttribute("aria-modal","true");viewer.setAttribute("aria-label","Product photograph viewer");
  viewer.innerHTML='<button class="photo-viewer-close" type="button" aria-label="Close image viewer">×</button><button class="photo-viewer-nav photo-viewer-prev" type="button" aria-label="Previous photograph">‹</button><div class="photo-viewer-content"><img class="photo-viewer-image" alt="Full-size product photograph"></div><button class="photo-viewer-nav photo-viewer-next" type="button" aria-label="Next photograph">›</button><p class="photo-viewer-count" aria-live="polite"></p>';
  document.body.appendChild(viewer);
  const fullImage=viewer.querySelector(".photo-viewer-image"),viewerCount=viewer.querySelector(".photo-viewer-count");
  let currentIndex=0,returnFocus=null;
  function showPhoto(index){currentIndex=(index+visibleImages.length)%visibleImages.length;fullImage.src=visibleImages[currentIndex].src;fullImage.alt="Rahul Housekeeping product photo "+(currentIndex+1);viewerCount.textContent=(currentIndex+1)+" / "+visibleImages.length;viewer.querySelector(".photo-viewer-prev").hidden=visibleImages.length<2;viewer.querySelector(".photo-viewer-next").hidden=visibleImages.length<2;viewer.querySelector(".photo-viewer-content").scrollTop=0;}
  function closeViewer(){viewer.hidden=true;document.body.classList.remove("photo-viewer-open");returnFocus?.focus();}
  grid.addEventListener("click",event=>{const trigger=event.target.closest("[data-image-index]");if(!trigger||!visibleImages.length)return;returnFocus=trigger;showPhoto(Number(trigger.dataset.imageIndex));viewer.hidden=false;document.body.classList.add("photo-viewer-open");viewer.querySelector(".photo-viewer-close").focus();});
  viewer.querySelector(".photo-viewer-close").addEventListener("click",closeViewer);
  viewer.querySelector(".photo-viewer-prev").addEventListener("click",()=>showPhoto(currentIndex-1));
  viewer.querySelector(".photo-viewer-next").addEventListener("click",()=>showPhoto(currentIndex+1));
  viewer.addEventListener("click",event=>{if(event.target===viewer)closeViewer();});
  document.addEventListener("keydown",event=>{if(viewer.hidden)return;if(event.key==="Escape")closeViewer();if(event.key==="ArrowLeft")showPhoto(currentIndex-1);if(event.key==="ArrowRight")showPhoto(currentIndex+1);});
  const menuToggle=document.querySelector(".menu-toggle"),nav=document.querySelector(".primary-nav");
  menuToggle?.addEventListener("click",()=>{const open=menuToggle.getAttribute("aria-expanded")!=="true";menuToggle.setAttribute("aria-expanded",String(open));menuToggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");nav?.classList.toggle("open",open);});
  nav?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{nav.classList.remove("open");menuToggle?.setAttribute("aria-expanded","false");menuToggle?.setAttribute("aria-label","Open navigation");}));
  const credit=document.querySelector(".developer-credit");
  if(credit&&"IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){credit.classList.add("is-visible");observer.disconnect();}},{threshold:.35});observer.observe(credit);}else credit?.classList.add("is-visible");
  const year=document.getElementById("current-year");if(year)year.textContent=new Date().getFullYear();
  render("all");
})();