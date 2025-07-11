import{i as d,w as l}from"./wait-BlTzaSj7.js";/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */d()?o():l("#stripe-bank-transfer-payment").then(()=>o());function o(){const s=document.querySelector('meta[name="stripe-client-secret"]')?.content,a=document.querySelector('meta[name="stripe-return-url"]')?.content,c={clientSecret:s,appearance:{theme:"stripe",variables:{colorPrimary:"#0570de",colorBackground:"#ffffff",colorText:"#30313d",colorDanger:"#df1b41",fontFamily:"Ideal Sans, system-ui, sans-serif",spacingUnit:"2px",borderRadius:"4px"}}},e=Stripe(document.querySelector('meta[name="stripe-publishable-key"]').getAttribute("content")),t=document.querySelector('meta[name="stripe-account-id"]')?.content??"";t&&(e.stripeAccount=t);const n=e.elements(c);n.create("payment").mount("#payment-element"),document.getElementById("payment-form").addEventListener("submit",async m=>{m.preventDefault(),document.getElementById("pay-now").disabled=!0,document.querySelector("#pay-now > svg").classList.add("hidden"),document.querySelector("#pay-now > span").classList.remove("hidden");const{error:r}=await e.confirmPayment({elements:n,confirmParams:{return_url:a}});if(r){document.getElementById("pay-now").disabled=!1,document.querySelector("svg").classList.remove("hidden"),document.querySelector("span").classList.add("hidden");const i=document.querySelector("#errors");i.textContent=r.message}})}
