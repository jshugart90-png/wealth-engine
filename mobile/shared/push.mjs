/**
 * Local notification helpers for seasonal deadline apps.
 * Used by sync-www.mjs hub launchers (1099-suite).
 */

/** Inline script: schedule Jan 15/25/31 deadline reminders on native platforms. */
export function deadlinePushInlineScript(storageKey = "1099_suite_push_scheduled") {
  return `(function(){
  if(!window.Capacitor||!window.Capacitor.isNativePlatform())return;
  try{
    if(localStorage.getItem("${storageKey}"))return;
    var LN=window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
    if(!LN)return;
    LN.requestPermissions().then(function(perm){
      if(!perm||perm.display!=="granted")return;
      var year=new Date().getFullYear();
      var deadlines=[
        {id:109915,month:0,day:15,title:"1099 prep: collect W-9s",body:"Gather W-9 forms from contractors paid $600+ this year"},
        {id:109925,month:0,day:25,title:"1099 deadline: 6 days left",body:"Jan 31 federal 1099-NEC filing deadline approaching"},
        {id:109931,month:0,day:31,title:"1099-NEC deadline TODAY",body:"File 1099-NEC forms today to avoid $60/form penalties"}
      ];
      var notifications=deadlines.map(function(d){
        var at=new Date(year,d.month,d.day,9,0,0);
        if(at<=new Date())return null;
        return {id:d.id,title:d.title,body:d.body,schedule:{at:at.toISOString()}};
      }).filter(Boolean);
      if(!notifications.length)return;
      return LN.schedule({notifications:notifications}).then(function(){
        localStorage.setItem("${storageKey}","1");
      });
    }).catch(function(){});
  }catch(e){}
})();`;
}

/** Inline script: schedule weekly client review + monthly billing reminders on native platforms. */
export function agencyPushInlineScript(storageKey = "statusping_agency_push_scheduled") {
  return `(function(){
  if(!window.Capacitor||!window.Capacitor.isNativePlatform())return;
  try{
    if(localStorage.getItem("${storageKey}"))return;
    var LN=window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
    if(!LN)return;
    LN.requestPermissions().then(function(perm){
      if(!perm||perm.display!=="granted")return;
      var now=new Date();
      var year=now.getFullYear();
      var month=now.getMonth();
      var reminders=[
        {id:891001,weekday:1,title:"Weekly client check",body:"Review StatusPing monitors and status pages for all client workspaces"},
        {id:891015,monthDay:15,title:"SSL cert review",body:"Check SSL expiry dates across client domains this week"},
        {id:891101,monthDay:1,title:"Agency billing day",body:"Reconcile client MRR and send monitoring invoices"}
      ];
      var notifications=reminders.map(function(d){
        var at;
        if(d.weekday!=null){
          at=new Date(now);
          var diff=(d.weekday-at.getDay()+7)%7;
          if(!diff)diff=7;
          at.setDate(at.getDate()+diff);
        }else{
          at=new Date(year,month,d.monthDay,9,0,0);
          if(at<=now)at=new Date(year,month+1,d.monthDay,9,0,0);
        }
        at.setHours(9,0,0,0);
        return {id:d.id,title:d.title,body:d.body,schedule:{at:at.toISOString()}};
      });
      return LN.schedule({notifications:notifications}).then(function(){
        localStorage.setItem("${storageKey}","1");
      });
    }).catch(function(){});
  }catch(e){}
})();`;
}

/** Inline script: export agency client roster to CSV download. */
export function agencyClientCsvExportScript(storageKey = "statusping_agency_clients") {
  return `(function(){
  var btn=document.getElementById("export-clients");
  if(!btn)return;
  btn.addEventListener("click",function(){
    try{
      var rows=JSON.parse(localStorage.getItem("${storageKey}")||"[]");
      if(!rows.length){alert("No clients saved yet — add workspaces in StatusPing first.");return;}
      var header=["Client","Domain","Monitors","Bill Rate","Notes"];
      var lines=[header.join(",")].concat(rows.map(function(r){
        return [r.name||"",r.domain||"",r.monitors||0,r.rate||"",r.notes||""].map(function(v){
          return '"'+String(v).replace(/"/g,'""')+'"';
        }).join(",");
      }));
      var blob=new Blob([lines.join("\\n")],{type:"text/csv"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url;
      a.download="agency-clients-"+new Date().toISOString().slice(0,10)+".csv";
      a.click();
      URL.revokeObjectURL(url);
    }catch(e){alert("Export failed — try again after saving clients.");}
  });
})();`;
}

/** Inline script: schedule monthly quota reset + weekly NDA review reminders on native platforms. */
export function teamPushInlineScript(storageKey = "ndagen_team_push_scheduled") {
  return `(function(){
  if(!window.Capacitor||!window.Capacitor.isNativePlatform())return;
  try{
    if(localStorage.getItem("${storageKey}"))return;
    var LN=window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
    if(!LN)return;
    LN.requestPermissions().then(function(perm){
      if(!perm||perm.display!=="granted")return;
      var now=new Date();
      var year=now.getFullYear();
      var month=now.getMonth();
      var reminders=[
        {id:421001,weekday:1,title:"Weekly NDA review",body:"Review pending NDAs and export quota for your team this week"},
        {id:421015,monthDay:1,title:"Team quota reset",body:"NDAGen Team export counter resets today — 50 NDAs available"},
        {id:421045,monthDay:20,title:"Export quota check",body:"Check remaining NDA exports before month-end billing"}
      ];
      var notifications=reminders.map(function(d){
        var at;
        if(d.weekday!=null){
          at=new Date(now);
          var diff=(d.weekday-at.getDay()+7)%7;
          if(!diff)diff=7;
          at.setDate(at.getDate()+diff);
        }else{
          at=new Date(year,month,d.monthDay,9,0,0);
          if(at<=now)at=new Date(year,month+1,d.monthDay,9,0,0);
        }
        at.setHours(9,0,0,0);
        return {id:d.id,title:d.title,body:d.body,schedule:{at:at.toISOString()}};
      });
      return LN.schedule({notifications:notifications}).then(function(){
        localStorage.setItem("${storageKey}","1");
      });
    }).catch(function(){});
  }catch(e){}
})();`;
}

/** Inline script: export NDA audit log to CSV download. */
export function ndagenAuditCsvExportScript(auditKey = "ndagen_audit_log", usageKey = "ndagen_exports_mo") {
  return `(function(){
  var btn=document.getElementById("export-audit");
  if(!btn)return;
  btn.addEventListener("click",function(){
    try{
      var rows=JSON.parse(localStorage.getItem("${auditKey}")||"[]");
      var header=["Date","Party A","Party B","State","Action"];
      var lines;
      if(rows.length){
        lines=[header.join(",")].concat(rows.map(function(r){
          return [r.date||"",r.partyA||"",r.partyB||"",r.state||"",r.action||""].map(function(v){
            return '"'+String(v).replace(/"/g,'""')+'"';
          }).join(",");
        }));
      }else{
        var raw=JSON.parse(localStorage.getItem("${usageKey}")||"{}");
        lines=[header.join(",")].concat([[
          new Date().toISOString().slice(0,10),
          "—","—","—",
          (raw.count||0)+"/50 exports used this month"
        ].map(function(v){
          return '"'+String(v).replace(/"/g,'""')+'"';
        }).join(",")]);
      }
      var blob=new Blob([lines.join("\\n")],{type:"text/csv"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url;
      a.download="ndagen-audit-"+new Date().toISOString().slice(0,10)+".csv";
      a.click();
      URL.revokeObjectURL(url);
    }catch(e){alert("Export failed — generate NDAs in NDAGen first.");}
  });
})();`;
}

/** Inline script: schedule monthly quota + weekly meeting review reminders on native platforms. */
export function meetingCostTeamPushInlineScript(storageKey = "meetingcost_team_push_scheduled") {
  return `(function(){
  if(!window.Capacitor||!window.Capacitor.isNativePlatform())return;
  try{
    if(localStorage.getItem("${storageKey}"))return;
    var LN=window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
    if(!LN)return;
    LN.requestPermissions().then(function(perm){
      if(!perm||perm.display!=="granted")return;
      var now=new Date();
      var year=now.getFullYear();
      var month=now.getMonth();
      var reminders=[
        {id:431001,weekday:1,title:"Weekly meeting waste review",body:"Review MeetingCost history and flag unnecessary recurring meetings"},
        {id:431015,monthDay:1,title:"Team report quota reset",body:"MeetingCost Team: 50 shareable reports available this month"},
        {id:431045,monthDay:20,title:"Report quota check",body:"Check remaining meeting reports before month-end billing"}
      ];
      var notifications=reminders.map(function(d){
        var at;
        if(d.weekday!=null){
          at=new Date(now);
          var diff=(d.weekday-at.getDay()+7)%7;
          if(!diff)diff=7;
          at.setDate(at.getDate()+diff);
        }else{
          at=new Date(year,month,d.monthDay,9,0,0);
          if(at<=now)at=new Date(year,month+1,d.monthDay,9,0,0);
        }
        at.setHours(9,0,0,0);
        return {id:d.id,title:d.title,body:d.body,schedule:{at:at.toISOString()}};
      });
      return LN.schedule({notifications:notifications}).then(function(){
        localStorage.setItem("${storageKey}","1");
      });
    }).catch(function(){});
  }catch(e){}
})();`;
}

/** Inline script: schedule weekly conversion check + monthly payout reminders on native platforms. */
export function partnersPushInlineScript(storageKey = "partners_push_scheduled") {
  return `(function(){
  if(!window.Capacitor||!window.Capacitor.isNativePlatform())return;
  try{
    if(localStorage.getItem("${storageKey}"))return;
    var LN=window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
    if(!LN)return;
    LN.requestPermissions().then(function(perm){
      if(!perm||perm.display!=="granted")return;
      var now=new Date();
      var year=now.getFullYear();
      var month=now.getMonth();
      var reminders=[
        {id:441001,weekday:3,title:"Weekly conversion check",body:"Review referral clicks and conversions in your partner dashboard"},
        {id:441015,monthDay:1,title:"Monthly payout day",body:"Wealth Engine Partners: commissions paid on the 1st — check pending balance"},
        {id:441025,monthDay:25,title:"Month-end commission review",body:"Export commission CSV and verify attributed sales before payout hold clears"}
      ];
      var notifications=reminders.map(function(d){
        var at;
        if(d.weekday!=null){
          at=new Date(now);
          var diff=(d.weekday-at.getDay()+7)%7;
          if(!diff)diff=7;
          at.setDate(at.getDate()+diff);
        }else{
          at=new Date(year,month,d.monthDay,9,0,0);
          if(at<=now)at=new Date(year,month+1,d.monthDay,9,0,0);
        }
        at.setHours(9,0,0,0);
        return {id:d.id,title:d.title,body:d.body,schedule:{at:at.toISOString()}};
      });
      return LN.schedule({notifications:notifications}).then(function(){
        localStorage.setItem("${storageKey}","1");
      });
    }).catch(function(){});
  }catch(e){}
})();`;
}

/** Inline script: export partner commission summary to CSV download. */
export function partnersCommissionCsvExportScript(codeKey = "we_partner_code", statsKey = "we_partner_stats") {
  return `(function(){
  var btn=document.getElementById("export-commissions");
  if(!btn)return;
  btn.addEventListener("click",function(){
    try{
      var code=localStorage.getItem("${codeKey}")||"";
      var stats={};
      try{stats=JSON.parse(localStorage.getItem("${statsKey}")||"{}")}catch(e){}
      var header=["Date","Partner Code","Clicks","Conversions","Pending USD","Notes"];
      var lines=[header.join(",")].concat([[
        new Date().toISOString().slice(0,10),
        code||"—",
        stats.clicks!=null?stats.clicks:"—",
        stats.conversions!=null?stats.conversions:"—",
        stats.pendingUsd!=null?stats.pendingUsd:"—",
        code?"Load dashboard to refresh stats":"Sign up at Partner Portal first"
      ].map(function(v){
        return '"'+String(v).replace(/"/g,'""')+'"';
      }).join(",")]);
      var blob=new Blob([lines.join("\\n")],{type:"text/csv"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url;
      a.download="partner-commissions-"+new Date().toISOString().slice(0,10)+".csv";
      a.click();
      URL.revokeObjectURL(url);
    }catch(e){alert("Export failed — sign up at Partner Portal first.");}
  });
})();`;
}

/** Inline script: cache partner stats from referral dashboard for launcher + CSV export. */
export function partnersStatsCacheScript(codeKey = "we_partner_code", statsKey = "we_partner_stats") {
  return `(function(){
  var code=localStorage.getItem("${codeKey}");
  var statEl=document.getElementById("partner-stat");
  if(!code){
    if(statEl)statEl.textContent="Sign up to get your referral code";
    return;
  }
  if(statEl)statEl.textContent="Code: "+code;
  fetch("/api/affiliate/stats?code="+encodeURIComponent(code)).then(function(r){return r.json()}).then(function(d){
    if(!d.ok)return;
    var pending="$"+Number(d.commissionPendingUsd||0).toFixed(2);
    localStorage.setItem("${statsKey}",JSON.stringify({
      clicks:d.clicks,
      conversions:d.conversions,
      pendingUsd:pending,
      updatedAt:new Date().toISOString()
    }));
    if(statEl)statEl.textContent=d.clicks+" clicks · "+d.conversions+" conversions · "+pending+" pending";
  }).catch(function(){});
})();`;
}

/** Inline script: export meeting history to CSV download. */
export function meetingCostHistoryCsvExportScript(historyKey = "meetingcost_history", usageKey = "meetingcost_reports_mo") {
  return `(function(){
  var btn=document.getElementById("export-history");
  if(!btn)return;
  btn.addEventListener("click",function(){
    try{
      var rows=JSON.parse(localStorage.getItem("${historyKey}")||"[]");
      var header=["Date","Attendees","Hourly Rate","Minutes","Cost","Notes"];
      var lines;
      if(rows.length){
        lines=[header.join(",")].concat(rows.map(function(r){
          return [r.date||"",r.attendees||"",r.rate||"",r.minutes||"",r.cost||"",r.notes||""].map(function(v){
            return '"'+String(v).replace(/"/g,'""')+'"';
          }).join(",");
        }));
      }else{
        var raw=JSON.parse(localStorage.getItem("${usageKey}")||"{}");
        lines=[header.join(",")].concat([[
          new Date().toISOString().slice(0,10),
          "—","—","—",
          localStorage.getItem("meetingcost_last")||"—",
          (raw.count||0)+"/50 reports used this month"
        ].map(function(v){
          return '"'+String(v).replace(/"/g,'""')+'"';
        }).join(",")]);
      }
      var blob=new Blob([lines.join("\\n")],{type:"text/csv"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url;
      a.download="meeting-history-"+new Date().toISOString().slice(0,10)+".csv";
      a.click();
      URL.revokeObjectURL(url);
    }catch(e){alert("Export failed — calculate meetings in MeetingCost first.");}
  });
})();`;
}

/** Inline script: export contractor threshold tracker to CSV download. */
export function contractorCsvExportScript(storageKey = "thresholdpro_contractors") {
  return `(function(){
  var btn=document.getElementById("export-contractors");
  if(!btn)return;
  btn.addEventListener("click",function(){
    try{
      var rows=JSON.parse(localStorage.getItem("${storageKey}")||"[]");
      if(!rows.length){alert("No contractors saved yet — add them in Threshold Tracker first.");return;}
      var header=["Name","TIN","YTD Paid","Needs 1099"];
      var lines=[header.join(",")].concat(rows.map(function(r){
        return [r.name||"",r.tin||"",r.paid||0,r.paid>=600?"yes":"no"].map(function(v){
          return '"'+String(v).replace(/"/g,'""')+'"';
        }).join(",");
      }));
      var blob=new Blob([lines.join("\\n")],{type:"text/csv"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url;
      a.download="1099-contractors-"+new Date().toISOString().slice(0,10)+".csv";
      a.click();
      URL.revokeObjectURL(url);
    }catch(e){alert("Export failed — try again after saving contractors.");}
  });
})();`;
}

/** Inline script: schedule weekly portfolio check + monthly catalog review on native platforms. */
export function wealthHubPushInlineScript(storageKey = "wealth_hub_push_scheduled") {
  return `(function(){
  if(!window.Capacitor||!window.Capacitor.isNativePlatform())return;
  try{
    if(localStorage.getItem("${storageKey}"))return;
    var LN=window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
    if(!LN)return;
    LN.requestPermissions().then(function(perm){
      if(!perm||perm.display!=="granted")return;
      var now=new Date();
      var year=now.getFullYear();
      var month=now.getMonth();
      var reminders=[
        {id:451001,weekday:1,title:"Weekly portfolio check",body:"Wealth Engine Hub: review recently used tools and games"},
        {id:451015,monthDay:1,title:"Monthly catalog review",body:"Export portfolio CSV — 45 apps with deep links for Excel"},
        {id:451025,monthDay:15,title:"Mid-month deep link refresh",body:"Open Wealth Engine Hub to sync offline copies of your favorites"}
      ];
      var notifications=reminders.map(function(d){
        var at;
        if(d.weekday!=null){
          at=new Date(now);
          var diff=(d.weekday-at.getDay()+7)%7;
          if(!diff)diff=7;
          at.setDate(at.getDate()+diff);
        }else{
          at=new Date(year,month,d.monthDay,9,0,0);
          if(at<=now)at=new Date(year,month+1,d.monthDay,9,0,0);
        }
        at.setHours(9,0,0,0);
        return {id:d.id,title:d.title,body:d.body,schedule:{at:at.toISOString()}};
      });
      return LN.schedule({notifications:notifications}).then(function(){
        localStorage.setItem("${storageKey}","1");
      });
    }).catch(function(){});
  }catch(e){}
})();`;
}

/** Inline script: export full portfolio catalog (45 apps) to CSV for Excel. */
export function wealthHubPortfolioCsvExportScript(portfolioJsonVar = "WE_PORTFOLIO") {
  return `(function(){
  var btn=document.getElementById("export-portfolio");
  if(!btn)return;
  btn.addEventListener("click",function(){
    try{
      var apps=window.${portfolioJsonVar}||[];
      var pro=false;
      try{pro=localStorage.getItem("we_iap_wealth-hub_pro_unlock")==="1"}catch(e){}
      var header=pro
        ?["#","App Name","Slug","Type","Bundle ID","Deep Link","Prod URL","IAP Products"]
        :["#","App Name","Slug","Type","Deep Link","Prod URL"];
      var lines=[header.join(",")].concat(apps.map(function(a){
        var row=pro
          ?[a.num,a.title,a.slug,a.type,a.bundleId||"",a.href,a.prodUrl,String(a.iapProducts||0)]
          :[a.num,a.title,a.slug,a.type,a.href,a.prodUrl];
        return row.map(function(v){
          return '"'+String(v).replace(/"/g,'""')+'"';
        }).join(",");
      }));
      var blob=new Blob([lines.join("\\n")],{type:"text/csv"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url;
      a.download="wealth-engine-portfolio-"+apps.length+"-apps-"+new Date().toISOString().slice(0,10)+".csv";
      a.click();
      URL.revokeObjectURL(url);
      if(!pro)alert("Pro unlock adds Bundle ID and IAP columns to the export.");
    }catch(e){alert("Export failed — try again.");}
  });
})();`;
}
