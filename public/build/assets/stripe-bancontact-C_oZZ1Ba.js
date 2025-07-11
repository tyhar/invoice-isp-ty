import{i as o,w as c}from"./wait-BlTzaSj7.js";/**
 * Invoice Ninja (https://invoiceninja.com)
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license 
 */class s{constructor(e,t){this.key=e,this.errors=document.getElementById("errors"),this.stripeConnect=t}setupStripe=()=>(this.stripeConnect?this.stripe=Stripe(this.key,{stripeAccount:this.stripeConnect}):this.stripe=Stripe(this.key),this);handle=()=>{document.getElementById("pay-now").addEventListener("click",e=>{let t=document.getElementById("errors");if(!document.getElementById("bancontact-name").value){t.textContent=document.querySelector("meta[name=translation-name-required]").content,t.hidden=!1,console.log("name");return}document.getElementById("pay-now").disabled=!0,document.querySelector("#pay-now > svg").classList.remove("hidden"),document.querySelector("#pay-now > span").classList.add("hidden"),this.stripe.confirmBancontactPayment(document.querySelector("meta[name=pi-client-secret").content,{payment_method:{billing_details:{name:document.getElementById("bancontact-name").value}},return_url:document.querySelector('meta[name="return-url"]').content})})}}function r(){const n=document.querySelector('meta[name="stripe-publishable-key"]')?.content??"",e=document.querySelector('meta[name="stripe-account-id"]')?.content??"";new s(n,e).setupStripe().handle()}o()?r():c("#stripe-bancontact-payment").then(()=>r());
