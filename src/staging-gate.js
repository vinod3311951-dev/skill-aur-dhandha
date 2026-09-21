import{STAGING_ACCESS}from"./config.js";

function storageGet(key){try{return localStorage.getItem(key)}catch{return null}}
function storageSet(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}

export async function enforceStagingGate(){
  const gate=document.querySelector("#preview-gate");
  const app=document.querySelector("#app");
  if(!gate||!app)throw new Error("Factory X staging gate markup is missing.");

  const openApp=()=>{gate.hidden=true;app.hidden=false};

  if(!STAGING_ACCESS.enabled){
    openApp();
    return true;
  }

  if(storageGet(STAGING_ACCESS.unlockKey)==="1"){
    openApp();
    return true;
  }

  app.hidden=true;
  gate.hidden=false;

  const form=document.querySelector("#preview-gate-form");
  const input=document.querySelector("#preview-password");
  const button=document.querySelector("#preview-unlock-btn");
  const status=document.querySelector("#preview-gate-status");
  if(!form||!input||!button||!status)throw new Error("Factory X staging gate controls are missing.");

  input.focus();

  return new Promise(resolve=>{
    let busy=false;
    form.addEventListener("submit",async event=>{
      event.preventDefault();
      if(busy)return;
      const password=input.value;
      if(!password){
        status.dataset.state="error";
        status.textContent="Enter the preview password.";
        return;
      }

      busy=true;
      button.disabled=true;
      status.dataset.state="";
      status.textContent="Checking password…";

      try{
        const response=await fetch(STAGING_ACCESS.authEndpoint,{
          method:"POST",
          headers:{"content-type":"application/json","accept":"application/json"},
          cache:"no-store",
          credentials:"same-origin",
          body:JSON.stringify({password})
        });
        const payload=await response.json().catch(()=>({}));

        if(response.ok&&payload.ok===true){
          storageSet(STAGING_ACCESS.unlockKey,"1");
          input.value="";
          status.dataset.state="ok";
          status.textContent="Access granted.";
          openApp();
          resolve(true);
          return;
        }

        input.value="";
        input.focus();
        status.dataset.state="error";
        if(response.status===401){
          status.textContent="Incorrect password. Try again.";
        }else if(response.status===503&&payload.error==="not_configured"){
          status.textContent="Preview password is not configured yet. Founder setup is required.";
        }else{
          status.textContent="Password check failed. Try again.";
        }
      }catch{
        status.dataset.state="error";
        status.textContent="Unable to verify the password. Check your connection and try again.";
      }finally{
        busy=false;
        button.disabled=false;
      }
    });
  });
}
