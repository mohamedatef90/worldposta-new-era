import { Component, input, output, signal } from '@angular/core';
interface Leaf { name:string; description:string; href:string; }
interface Category { id:string; label:string; items:Leaf[]; }
interface Menu { id:string; label:string; href?:string; allHref?:string; tabs?:Category[]; items?:Leaf[]; }
@Component({
 selector:'app-main-nav-links',
 host:{style:'display: contents','(document:keydown.escape)':'close()','(document:click)':'outside($event)'},
 template: `
 @for (menu of menus; track menu.id) {
   @if (menu.href) {
     <a class="nav-link" [href]="menu.href" (click)="linkClick.emit()">{{menu.label}}</a>
   } @else {
     <div class="nav-group" [class.is-mobile]="mobile()">
       <button type="button" class="nav-link" [attr.aria-expanded]="open()===menu.id" [attr.aria-controls]="prefix()+menu.id" (click)="toggle(menu.id)">{{menu.label}} <span class="chevron" aria-hidden="true"></span></button>
       @if(open()===menu.id) {
         <div class="mega-panel" [id]="prefix()+menu.id">
           @if(menu.tabs) {
             <div class="mega-categories" aria-label="Categories">
               @for(category of menu.tabs;track category.id) {
                 <button type="button" [class.active]="selected()===category.id" [attr.aria-pressed]="selected()===category.id" (click)="selected.set(category.id)">{{category.label}} <span>{{category.items.length}}</span></button>
               }
               <a [href]="external(menu.allHref)" (click)="close();linkClick.emit()">View all →</a>
             </div>
           }
           <div class="mega-grid">
             @for(item of items(menu);track item.href) {
               <a [href]="item.href" (click)="close();linkClick.emit()"><span class="item-symbol" aria-hidden="true">◇</span><span><strong>{{item.name}}</strong><small>{{item.description}}</small></span></a>
             }
           </div>
         </div>
       }
     </div>
   }
 }
 `,
 styles:[`
 .nav-link{display:flex;align-items:center;gap:7px;min-height:44px;padding:0 10px;color:#39453e;font:inherit;font-size:14px;white-space:nowrap;background:none;border:0;text-decoration:none;cursor:pointer;border-radius:8px}
 .nav-link:hover{background:#edf2e7;color:#578832}.chevron{width:6px;height:6px;border-right:1.5px solid;border-bottom:1.5px solid;transform:rotate(45deg);margin:-3px 2px 0}
 .mega-panel{position:absolute;left:0;right:0;top:calc(100% + 10px);display:flex;background:#fdfdf9;border:1px solid #d7d9cf;border-radius:18px;padding:20px;box-shadow:0 18px 40px #10201620;color:#27362d;max-height:70vh;overflow:auto}
 .mega-categories{width:210px;flex-shrink:0;border-right:1px solid #e3e5dd;padding-right:18px;display:flex;flex-direction:column;gap:5px}
 .mega-categories button,.mega-categories a{border:0;background:none;color:inherit;font:inherit;text-align:left;display:flex;justify-content:space-between;padding:14px;border-radius:9px;cursor:pointer;text-decoration:none;font-size:14px}
 .mega-categories button.active{background:#eaf1df;color:#56872e;font-weight:700}.mega-categories a{margin-top:auto;color:#56872e}.mega-grid{padding-left:18px;flex:1;display:grid;grid-template-columns:1fr 1fr;gap:6px}
 .mega-grid a{display:flex;gap:14px;padding:16px;border-radius:12px;text-decoration:none;color:inherit;min-height:68px}.mega-grid a:hover{background:#edf2e7}.item-symbol{color:#699c3d;background:#eaf1e1;display:grid;place-items:center;width:36px;height:36px;flex-shrink:0;border-radius:9px;font-size:25px}.mega-grid strong{font-size:14px;display:block}.mega-grid small{display:block;font-size:12px;line-height:1.5;color:#6b766d;margin-top:5px}
 :is(button,a):focus-visible{outline:2px solid #699c3d;outline-offset:3px}
 .is-mobile .nav-link{width:100%;justify-content:space-between;font-size:16px;padding:12px}.is-mobile .mega-panel{position:static;display:block;padding:10px;box-shadow:none;max-height:none}.is-mobile .mega-categories{width:100%;border:0;padding:0;flex-direction:row;flex-wrap:wrap}.is-mobile .mega-categories button{gap:10px}.is-mobile .mega-grid{padding:0;grid-template-columns:1fr}.is-mobile .mega-grid a{padding:12px}.is-mobile{width:100%}
 `]
})
export class MainNavLinksComponent {
 readonly mobile=input(false);readonly linkClick=output<void>();
 private readonly catalog:Menu[]=[
  {
    "id": "products",
    "label": "Products",
    "allHref": "/products",
    "tabs": [
      {
        "id": "cloudedge",
        "label": "CloudEdge",
        "items": [
          {
            "name": "CloudEdge",
            "description": "Scalable IaaS, VMs, and resource pools",
            "href": "/cloudedge"
          },
          {
            "name": "SAP",
            "description": "Managed SAP hosting, security and operations",
            "href": "/sap"
          },
          {
            "name": "Virtual Data Center",
            "description": "Run a full VDC, not just VMs",
            "href": "https://www.worldposta.com/virtual-data-centre-vs-traditional-vms"
          },
          {
            "name": "Cloud Firewall",
            "description": "Stateful firewall with managed rules",
            "href": "https://www.worldposta.com/cloud-firewall"
          },
          {
            "name": "NextGen Computing",
            "description": "H100 GPUs on AMD EPYC 9555",
            "href": "https://www.worldposta.com/gpu-instances"
          },
          {
            "name": "Scalability & Performance",
            "description": "Auto-tuning across your workload",
            "href": "https://www.worldposta.com/cloud-resource-optimization"
          },
          {
            "name": "Resource Pools",
            "description": "Dedicated CPU, RAM, and storage",
            "href": "https://www.worldposta.com/dedicated-compute-instances"
          },
          {
            "name": "Ransomware Protection",
            "description": "Immutable backups, instant restore",
            "href": "https://www.worldposta.com/cloud-ransomware-protection"
          },
          {
            "name": "Comprehensive Security",
            "description": "Layered security across the stack",
            "href": "https://www.worldposta.com/comprehensive-cloud-security-solutions"
          }
        ]
      },
      {
        "id": "posta",
        "label": "Posta",
        "items": [
          {
            "name": "Posta",
            "description": "Enterprise email hosting",
            "href": "/posta"
          },
          {
            "name": "Drive", "description": "Files, sharing and team collaboration", "href": "/drive" }, { "name": "Link",
            "description": "Team chat, meetings and connected workspaces",
            "href": "/link"
          },
          {
            "name": "Posta Hybrid",
            "description": "Hybrid M365 + Posta deployments",
            "href": "https://www.worldposta.com/posta-hybrid"
          }
        ]
      },
      {
        "id": "cloudspace",
        "label": "CloudSpace",
        "items": [
          {
            "name": "CloudSpace",
            "description": "Collaboration suite with AI tools",
            "href": "/cloudspace"
          }
        ]
      }
    ]
  },
  {
    "id": "solutions",
    "label": "Solutions",
    "allHref": "/solutions",
    "tabs": [
      {
        "id": "backup",
        "label": "Backup",
        "items": [
          {
            "name": "Comprehensive Backup",
            "description": "Cloud-native backup for any workload",
            "href": "https://www.worldposta.com/cloud-backup"
          },
          {
            "name": "Mission-Critical Backup",
            "description": "RPO/RTO for production systems",
            "href": "https://www.worldposta.com/mission-critical-data-backup"
          },
          {
            "name": "Veeam Cloud Connect",
            "description": "Veeam-certified offsite repository",
            "href": "https://www.worldposta.com/veeam-cloud-connect"
          }
        ]
      },
      {
        "id": "security",
        "label": "Security",
        "items": [
          {
            "name": "Advanced Security",
            "description": "Managed SOC, EDR, and SIEM",
            "href": "https://www.worldposta.com/cloud-security-solutions"
          },
          {
            "name": "Cloud SOC",
            "description": "24/7 security operations center",
            "href": "https://www.worldposta.com/cloud-based-soc-solutions"
          },
          {
            "name": "Ransomware Protection",
            "description": "Immutable backups + recovery drills",
            "href": "https://www.worldposta.com/cloud-ransomware-protection"
          }
        ]
      },
      {
        "id": "migration",
        "label": "Migration",
        "items": [
          {
            "name": "Email Migration",
            "description": "M365/Google/IMAP to Posta",
            "href": "https://www.worldposta.com/email-migration"
          },
          {
            "name": "Seamless Migration",
            "description": "Zero-downtime infrastructure move",
            "href": "/seamless-migration"
          }
        ]
      }
    ]
  },
  {
    "id": "service",
    "label": "Service Provider",
    "allHref": "/service-provider",
    "items": [
      {
        "name": "SAP Basis Operations", "description": "SAP administration, monitoring and optimization", "href": "/sap-basis-operations" }, { "name": "WPSYS", "description": "Managed IT, cybersecurity and cloud operations", "href": "/wpsys" }, { "name": "Overview",
        "description": "The operator model, in five minutes",
        "href": "https://www.worldposta.com/operator-overview"
      },
      {
        "name": "Core Value",
        "description": "One platform, not a pile of parts",
        "href": "https://www.worldposta.com/operator-core-value"
      },
      {
        "name": "Competitive Analysis",
        "description": "Who else covers this stack (nobody)",
        "href": "https://www.worldposta.com/operator-competitive-analysis"
      },
      {
        "name": "Platform Spine",
        "description": "Identity, billing and the Atrium control panel",
        "href": "https://www.worldposta.com/operator-platform-spine"
      },
      {
        "name": "Posta Suite",
        "description": "White-label collaboration, sovereign and hybrid-ready",
        "href": "https://www.worldposta.com/operator-posta-suite"
      },
      {
        "name": "NextEdge Suite",
        "description": "Fully managed sovereign cloud infrastructure",
        "href": "https://www.worldposta.com/operator-nextedge"
      },
      {
        "name": "Partner Program",
        "description": "Commercials, deployment options and next steps",
        "href": "https://www.worldposta.com/operator-partner-program"
      }
    ]
  },
  {
    "id": "postagate",
    "label": "Posta Gate",
    "href": "/posta-gate-security"
  },
  {
    "id": "pricing",
    "label": "Pricing",
    "href": "#pricing"
  },
  {
    "id": "docs",
    "label": "Docs",
    "href": "/knowledge-base"
  }
];
 protected readonly menus:Menu[]=this.catalog.flatMap(menu=>menu.id==='products' ? (menu.tabs??[]).map(category=>category.items.length===1 ? {id:category.id,label:category.label,href:category.items[0]!.href} : {id:category.id,label:category.label,items:category.items}) : [menu]);
 protected readonly open=signal('');protected readonly selected=signal('');
 protected prefix(){return this.mobile()?'mobile-menu-':'desktop-menu-';}
 protected toggle(id:string){this.open.update(value=>value===id?'':id);this.selected.set(this.menus.find(m=>m.id===id)?.tabs?.[0]?.id??'');}
 protected items(menu:Menu){return menu.items??menu.tabs?.find(tab=>tab.id===this.selected())?.items??[];}
 protected external(href?:string){return 'https://www.worldposta.com'+(href??'');}
 protected close(){this.open.set('');}
 protected outside(event:Event){if(!(event.target instanceof Element)||!event.target.closest('app-main-nav-links'))this.close();}
}







