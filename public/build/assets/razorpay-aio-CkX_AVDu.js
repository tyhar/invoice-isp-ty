import{i as r,w as i}from"./wait-BlTzaSj7.js";/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license 
 */function a(){let e=JSON.parse(document.querySelector("meta[name=razorpay-options]")?.content);e.handler=function(n){document.getElementById("razorpay_payment_id").value=n.razorpay_payment_id,document.getElementById("razorpay_signature").value=n.razorpay_signature,document.getElementById("server-response").submit()},e.modal={ondismiss:function(){t.disabled=!1}};let o=new Razorpay(e),t=document.getElementById("pay-now");t.onclick=function(n){t.disabled=!0,o.open()}}r()?a():i("#razorpay-hosted-payment").then(()=>a());
