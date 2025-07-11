/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */class n{initializeWePay(){let e=document.querySelector('meta[name="wepay-environment"]')?.content;return WePay.set_endpoint(e==="staging"?"stage":"production"),this}showBankPopup(){WePay.bank_account.create({client_id:document.querySelector("meta[name=wepay-client-id]")?.content,email:document.querySelector("meta[name=contact-email]")?.content,options:{avoidMicrodeposits:!0}},function(e){e.error?(errors.textContent="",errors.textContent=e.error_description,errors.hidden=!1):(document.querySelector('input[name="bank_account_id"]').value=e.bank_account_id,document.getElementById("server_response").submit())},function(e){e.error&&(errors.textContent="",errors.textContent=e.error_description,errors.hidden=!1)})}handle(){this.initializeWePay().showBankPopup()}}document.addEventListener("DOMContentLoaded",()=>{new n().handle()});
