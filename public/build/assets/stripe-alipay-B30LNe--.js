import{i as r,w as o}from"./wait-BlTzaSj7.js";/**
 * Invoice Ninja (https://invoiceninja.com)
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */class i{constructor(e,t){this.key=e,this.stripeConnect=t,this.errors=document.getElementById("errors")}setupStripe=()=>(this.stripeConnect?this.stripe=Stripe(this.key,{stripeAccount:this.stripeConnect}):this.stripe=Stripe(this.key),this);async handle(){document.getElementById("pay-now").addEventListener("click",async e=>{document.getElementById("pay-now").disabled=!0,document.querySelector("#pay-now > svg").classList.add("hidden"),document.querySelector("#pay-now > span").classList.remove("hidden");const{error:t}=await this.stripe.confirmAlipayPayment(document.querySelector("meta[name=ci_intent]").content,{return_url:`${document.querySelector("meta[name=return_url]").content}`});document.getElementById("pay-now").disabled=!1,document.querySelector("#pay-now > svg").classList.remove("hidden"),document.querySelector("#pay-now > span").classList.add("hidden"),t&&(this.errors.textContent="",this.errors.textContent=result.error.message,this.errors.hidden=!1)})}}function s(){const n=document.querySelector('meta[name="stripe-publishable-key"]')?.content??"",e=document.querySelector('meta[name="stripe-account-id"]')?.content??"";new i(n,e).setupStripe().handle()}r()?s():o("#stripe-alipay-payment").then(()=>s());
