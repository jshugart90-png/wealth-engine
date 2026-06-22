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

/** Inline script: schedule monthly quota + weekly audit reminders on native platforms. */
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
        {id:421001,monthDay:1,title:"NDA quota reset",body:"50 Team exports available this month — generate NDAs in NDAGen"},
        {id:421015,monthDay:15,title:"Mid-month NDA check",body:"Review exports used vs 50/mo limit in NDAGen Team"},
        {id:421101,weekday:1,title:"Weekly NDA audit",body:"Review pending NDAs and export audit log for compliance"}
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
export function ndagenAuditCsvExportScript(storageKey = "ndagen_audit_log") {
  return `(function(){
  var btn=document.getElementById("export-audit");
  if(!btn)return;
  btn.addEventListener("click",function(){
    try{
      var rows=JSON.parse(localStorage.getItem("${storageKey}")||"[]");
      if(!rows.length){
        var usage=JSON.parse(localStorage.getItem("ndagen_exports_mo")||"{}");
        if(usage.count){
          rows=[{partyA:"—",partyB:"—",state:"—",createdAt:new Date().toISOString().slice(0,10),status:"tracked-only",notes:usage.count+" exports this month (no audit entries yet)"}];
        }else{alert("No NDAs logged yet — generate NDAs in NDAGen first.");return;}
      }
      var header=["Party A","Party B","State","Created","Status","Notes"];
      var lines=[header.join(",")].concat(rows.map(function(r){
        return [r.partyA||"",r.partyB||"",r.state||"",r.createdAt||"",r.status||"",r.notes||""].map(function(v){
          return '"'+String(v).replace(/"/g,'""')+'"';
        }).join(",");
      }));
      var blob=new Blob([lines.join("\\n")],{type:"text/csv"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url;
      a.download="nda-audit-log-"+new Date().toISOString().slice(0,10)+".csv";
      a.click();
      URL.revokeObjectURL(url);
    }catch(e){alert("Export failed — try again after generating NDAs.");}
  });
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

/** Inline script: export threshold tracker contractors to CSV download. */
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
