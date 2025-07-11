import{i as r,w as s}from"./wait-BlTzaSj7.js";/**
 * Invoice Ninja (https://invoiceninja.com)
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://opensource.org/licenses/AAL
 */class d{constructor(e){this.apiLoginId=e}handleAuthorization=()=>{var e=document.getElementById("account-number").value,t=document.getElementById("routing-number").value,a={api_login_id:this.apiLoginId,account_number:e,routing_number:t,account_type:"checking"};return document.getElementById("pay-now")&&(document.getElementById("pay-now").disabled=!0,document.querySelector("#pay-now > svg").classList.remove("hidden"),document.querySelector("#pay-now > span").classList.add("hidden")),forte.createToken(a).success(this.successResponseHandler).error(this.failedResponseHandler),!1};successResponseHandler=e=>(document.getElementById("payment_token").value=e.onetime_token,document.getElementById("server_response").submit(),!1);failedResponseHandler=e=>{var t='<div class="alert alert-failure mb-4"><ul><li>'+e.response_description+"</li></ul></div>";return document.getElementById("forte_errors").innerHTML=t,document.getElementById("pay-now").disabled=!1,document.querySelector("#pay-now > svg").classList.add("hidden"),document.querySelector("#pay-now > span").classList.remove("hidden"),!1};handle=()=>{let e=document.getElementById("pay-now");return e&&e.addEventListener("click",t=>{this.handleAuthorization()}),this}}function o(){const n=document.querySelector('meta[name="forte-api-login-id"]').content;new d(n).handle()}r()?o():s("#force-ach-payment").then(()=>o());
