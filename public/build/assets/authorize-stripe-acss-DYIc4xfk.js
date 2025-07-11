import{w as m}from"./wait-BlTzaSj7.js";/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */m("#stripe-acss-authorize").then(()=>p());function p(){let n;const a=document.querySelector('meta[name="stripe-account-id"]')?.content,r=document.querySelector('meta[name="stripe-publishable-key"]')?.content;a&&a.length>0?n=Stripe(r,{stripeAccount:a}):n=Stripe(r);const c=document.getElementById("acss-name"),s=document.getElementById("acss-email-address"),t=document.getElementById("authorize-acss"),i=document.querySelector('meta[name="stripe-pi-client-secret"]')?.content,e=document.getElementById("errors");t.addEventListener("click",async l=>{l.preventDefault(),e.hidden=!0,t.disabled=!0;const o=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;if(s.value.length<3||!s.value.match(o)){e.textContent="Please enter a valid email address.",e.hidden=!1,t.disabled=!1;return}if(c.value.length<3){e.textContent="Please enter a name for the account holder.",e.hidden=!1,t.disabled=!1;return}const{setupIntent:d,error:u}=await n.confirmAcssDebitSetup(i,{payment_method:{billing_details:{name:c.value,email:s.value}}});document.getElementById("gateway_response").value=JSON.stringify(d??u),document.getElementById("server_response").submit()})}
