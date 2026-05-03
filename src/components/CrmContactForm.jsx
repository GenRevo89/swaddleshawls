"use client";
import React, { useEffect } from "react";

export default function CrmContactForm({ heading, subtitle }) {
  useEffect(() => {
    const formSlug = "contact-form-be161cec";
    const apiEndpoint = "https://crm.basalthq.com//api/forms/submit";
    const captchaRequired = false;
    
    // Theme configuration updated to match SwaddleShawls
    const theme = {
      primaryColor: "#A6513A", // var(--henna-500)
      backgroundColor: "#ffffff",
      textColor: "#4A3B32", // var(--brown-800)
      borderColor: "#DCD0C6", // var(--brown-200)
      borderRadius: "0.5rem",
      fontFamily: "inherit",
      buttonTextColor: "#ffffff",
      labelColor: "#7A6355", // var(--brown-600)
      inputBgColor: "#F7F5F0" // var(--warm-cream)
    };
    
    const container = document.getElementById("form-" + formSlug);
    if (!container) return;
    
    // Clear in case of React StrictMode double mount
    container.innerHTML = "";
    
    const form = document.createElement("form");
    form.id = "crm-form-" + formSlug;
    form.enctype = "multipart/form-data"; // Enable file uploads
    form.style.cssText = "width:100%;font-family:" + theme.fontFamily + ";background:" + theme.backgroundColor + ";padding:32px;border-radius:" + theme.borderRadius + ";";
    
    const fields = [
      {"name":"first_name","label":"Full Name","type":"text","required":true,"placeholder":"John Doe"},
      {"name":"email","label":"Email Address","type":"email","required":true,"placeholder":"you@example.com"},
      {"name":"phone","label":"Contact Phone","type":"phone","required":false,"placeholder":"+1 (555) 123-4567"},
      {"name":"company","label":"Company / Organization","type":"text","required":false,"placeholder":"Your Company Name"},
      {"name":"inquiry_type","label":"Inquiry Type","type":"select","required":false,"placeholder":"Select Inquiry Type"},
      {"name":"message","label":"Detailed Message","type":"textarea","required":true,"placeholder":"How can we help you?"}
    ];
    
    fields.forEach(function(field) {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "20px";
      
      // Label
      if (field.type !== "hidden") {
          const label = document.createElement("label");
          label.textContent = field.label + (field.required ? " *" : "");
          label.style.cssText = "display:block;margin-bottom:8px;font-weight:700;color:" + theme.labelColor + ";font-size:14px;";
          wrapper.appendChild(label);
      }
      
      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 4;
      } else if (field.type === "select") {
         input = document.createElement("select");
         const defaultOpt = document.createElement("option");
         defaultOpt.value = "";
         defaultOpt.textContent = field.placeholder || "Select an option";
         input.appendChild(defaultOpt);
         
         const opts = ["Product Information", "Wholesale / Boutique Partnership", "Custom Design Request", "Gift Order", "Care & Maintenance", "Other"];
         opts.forEach(o => {
           const opt = document.createElement("option");
           opt.value = o.toLowerCase().replace(/\s+/g, '_');
           opt.textContent = o;
           input.appendChild(opt);
         });
      } else {
        input = document.createElement("input");
        input.type = field.type === "file" ? "file" : 
                     field.type === "email" ? "email" : 
                     field.type === "phone" ? "tel" : "text";
      }
      
      input.name = field.name;
      input.required = field.required;
      if (field.placeholder && field.type !== "file") input.placeholder = field.placeholder;
      
      // Styling
      input.style.cssText = "width:100%;padding:12px 16px;border:1px solid " + theme.borderColor + ";outline:none;border-radius:" + theme.borderRadius + ";font-size:14px;background:" + theme.inputBgColor + ";color:" + theme.textColor + ";box-sizing:border-box;transition:all 0.2s ease-in-out;";
      input.onfocus = function() { this.style.borderColor = theme.primaryColor; };
      input.onblur = function() { this.style.borderColor = theme.borderColor; };
      
      // Wrapper append
      wrapper.appendChild(input);
      form.appendChild(wrapper);
    });
    
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Submit Request";
    submit.style.cssText = "background:" + theme.primaryColor + ";color:" + theme.buttonTextColor + ";border:none;padding:16px 32px;border-radius:" + theme.borderRadius + ";cursor:pointer;font-size:16px;font-weight:700;width:100%;margin-top:12px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);transition:all 0.3s ease;";
    
    if (captchaRequired) {
      const turnstileWrapper = document.createElement("div");
      turnstileWrapper.className = "cf-turnstile";
      turnstileWrapper.dataset.sitekey = "";
      turnstileWrapper.style.marginBottom = "16px";
      form.appendChild(turnstileWrapper);
    }

    form.appendChild(submit);
    
    // Hover effect
    submit.onmouseover = function() { this.style.transform = "translateY(-2px)"; this.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"; };
    submit.onmouseout = function() { this.style.transform = "none"; this.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; };
    
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      submit.disabled = true;
      submit.textContent = "Submitting...";
      submit.style.opacity = "0.7";
      
      // Use FormData for File Upload Support
      const formData = new FormData(form);
      
      // Append System Fields
      formData.append("form_slug", formSlug);
      formData.append("source_url", window.location.href);
      if (document.referrer) formData.append("referrer", document.referrer);
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("utm_source")) formData.append("utm_source", urlParams.get("utm_source"));
      if (urlParams.has("utm_medium")) formData.append("utm_medium", urlParams.get("utm_medium"));
      if (urlParams.has("utm_campaign")) formData.append("utm_campaign", urlParams.get("utm_campaign"));

      if (captchaRequired) {
          const token = form.querySelector('[name="cf-turnstile-response"]')?.value;
          if (token) formData.append("captcha_token", token);
      }
      
      fetch(apiEndpoint, {
        method: "POST",
        body: formData // Browser sets Content-Type: multipart/form-data with boundary
      })
      .then(function(r) { return r.json(); })
      .then(function(result) {
        if (result.success) {
          form.innerHTML = "<div style='text-align:center;padding:40px 20px;'><div style='width:64px;height:64px;margin:0 auto 16px auto;border-radius:50%;background:#F3EAE8;display:flex;align-items:center;justify-content:center;color:" + theme.primaryColor + ";font-size:24px;'>✓</div><h3 style='font-size:20px;font-weight:700;color:" + theme.textColor + ";margin-bottom:8px;'>Thank you!</h3><p style='color:" + theme.labelColor + ";'>" + (result.message || "We've received your submission.") + "</p></div>";
          if (result.redirect_url) window.location.href = result.redirect_url;
        } else {
          alert(result.error || "Submission failed");
          submit.disabled = false;
          submit.textContent = "Submit Request";
          submit.style.opacity = "1";
        }
      })
      .catch(function() {
        alert("Submission failed");
        submit.disabled = false;
        submit.textContent = "Submit Request";
        submit.style.opacity = "1";
      });
    });
    
    container.appendChild(form);
    
    // Cleanup function to prevent React unmount errors on client-side transition
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <section id="contact" className="py-24 border-t" style={{ backgroundColor: "var(--brown-50)", borderColor: "var(--brown-100)" }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--brown-800)", fontFamily: "var(--font-heading)" }}>
            {heading || "Get In Touch"}
          </h2>
          <div className="section-divider mb-6"></div>
          <p style={{ color: "var(--brown-500)" }}>
            {subtitle || "We'd love to hear from you. Send us a message and we'll respond promptly."}
          </p>
        </div>

        <div className="flex justify-center">
          <div id="form-contact-form-be161cec" className="w-full max-w-[550px] shadow-2xl rounded-2xl overflow-hidden bg-white"></div>
        </div>
      </div>
    </section>
  );
}
