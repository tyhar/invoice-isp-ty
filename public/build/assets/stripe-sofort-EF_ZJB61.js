import{i as r,w as o}from"./wait-BlTzaSj7.js";/**
 * Invoice Ninja (https://invoiceninja.com)
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license 
 */class c{constructor(e,s){this.key=e,this.errors=document.getElementById("errors"),this.stripeConnect=s}setupStripe=()=>(this.stripeConnect?this.stripe=Stripe(this.key,{stripeAccount:this.stripeConnect}):this.stripe=Stripe(this.key),this);handle=()=>{document.getElementById("pay-now").addEventListener("click",e=>{document.getElementById("pay-now").disabled=!0,document.querySelector("#pay-now > svg").classList.remove("hidden"),document.querySelector("#pay-now > span").classList.add("hidden"),this.stripe.confirmSofortPayment(document.querySelector("meta[name=pi-client-secret").content,{payment_method:{sofort:{country:document.querySelector('meta[name="country"]').content}},return_url:document.querySelector('meta[name="return-url"]').content})})}}function t(){const n=document.querySelector('meta[name="stripe-publishable-key"]')?.content??"",e=document.querySelector('meta[name="stripe-account-id"]')?.content??"";new c(n,e).setupStripe().handle()}r()?t():o("#stripe-sofort-payment").then(()=>t());r()?t():o("#stripe-sofort-payment").then(()=>t());
