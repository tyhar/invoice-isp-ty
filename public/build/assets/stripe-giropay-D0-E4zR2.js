import{i as o,w as s}from"./wait-BlTzaSj7.js";/**
 * Invoice Ninja (https://invoiceninja.com)
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license 
 */class i{constructor(e,t){this.key=e,this.errors=document.getElementById("errors"),this.stripeConnect=t}setupStripe=()=>(this.stripeConnect?this.stripe=Stripe(this.key,{stripeAccount:this.stripeConnect}):this.stripe=Stripe(this.key),this);handle=()=>{document.getElementById("pay-now").addEventListener("click",e=>{let t=document.getElementById("errors");if(!document.getElementById("giropay-mandate-acceptance").checked){t.textContent=document.querySelector("meta[name=translation-terms-required]").content,t.hidden=!1,console.log("Terms");return}document.getElementById("pay-now").disabled=!0,document.querySelector("#pay-now > svg").classList.remove("hidden"),document.querySelector("#pay-now > span").classList.add("hidden"),this.stripe.confirmGiropayPayment(document.querySelector("meta[name=pi-client-secret").content,{payment_method:{billing_details:{name:document.getElementById("giropay-name").value}},return_url:document.querySelector('meta[name="return-url"]').content})})}}function r(){const n=document.querySelector('meta[name="stripe-publishable-key"]')?.content??"",e=document.querySelector('meta[name="stripe-account-id"]')?.content??"";new i(n,e).setupStripe().handle()}o()?r():s("#stripe-giropay-payment").then(()=>r());
