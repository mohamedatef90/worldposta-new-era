import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { scrollToFragmentOnClick } from '../../shared/utils';
import { Component, inject, signal } from '@angular/core';
import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFolder, faCalendarDays, faUsers, faNoteSticky, faLayerGroup, faCheck, faShieldHalved, faVideo, faComments, faChartSimple, faLock, faEnvelope, faFileLines, faCoins, faPhone, faLocationDot, faHeadset, faClock, faBell, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { PageJumpNavComponent } from '@/shared/page-jump-nav/page-jump-nav.component';
@Component({
 selector: 'app-cloudspace',
 host: { '(click)': 'onInPageAnchorClick($event)' },
 imports: [PageJumpNavComponent, SiteHeaderComponent, NgOptimizedImage, FaIconComponent, SiteFooterComponent],
 templateUrl: './cloudspace.component.html',
 styleUrl: './cloudspace.component.css',
})
export class CloudSpace {
 private readonly document = inject(DOCUMENT);
 protected onInPageAnchorClick(event: MouseEvent): void { scrollToFragmentOnClick(event, this.document); }
 protected readonly icons = {folder:faFolder, calendar:faCalendarDays, users:faUsers, notes:faNoteSticky, apps:faLayerGroup, check:faCheck, shield:faShieldHalved, video:faVideo, chat:faComments, chart:faChartSimple, lock:faLock, mail:faEnvelope, file:faFileLines, cost:faCoins, phone:faPhone, location:faLocationDot, support:faHeadset, clock:faClock, bell:faBell, send:faPaperPlane};
 protected readonly tools = [
 {name:'Drive',copy:'Store, share and collaborate on files securely.',icon:faFolder,color:'green',items:['Documents','Spreadsheets','Presentations','PDF files']},
 {name:'Calendar',copy:'Plan, schedule and stay in sync with your team.',icon:faCalendarDays,color:'blue',items:['Team schedules','Shared calendars','Meeting reminders','Events']},
 {name:'Connect',copy:'Team chat and video meetings in one place.',icon:faUsers,color:'purple',items:['Team chat','Video meetings','Channels','Audio calls','Screen sharing']},
 {name:'Notes',copy:'Capture ideas and keep track of important information.',icon:faNoteSticky,color:'orange',items:['Meeting notes','Project ideas','Action items','Personal notes']},
 {name:'Apps',copy:'Access all your essential tools in one place.',icon:faLayerGroup,color:'blue',items:['Documents','Sheets','Slides','PDF']},
 {name:'Tasks',copy:'Manage tasks, assign work and stay productive.',icon:faCheck,color:'green',items:['Assign work','Track progress','Stay organized','Work together']},
 ];
 protected readonly challenges = [
 {name:'Scattered Files',copy:'Important documents get lost across drives, emails and personal devices.',icon:faFileLines},
 {name:'Disorganized Communication',copy:'Conversations happen in multiple apps, making it hard to keep track.',icon:faComments},
 {name:'Multiple Calendars',copy:'Meetings and schedules are spread across different platforms, leading to conflicts and missed updates.',icon:faCalendarDays},
 {name:'Limited Collaboration',copy:'Teams struggle to work together in real time, especially across locations.',icon:faUsers},
 {name:'Security Concerns',copy:'Sharing files and sensitive information outside the company increases risk.',icon:faShieldHalved},
 {name:'Lower Productivity',copy:'Switching between tools and searching for information wastes valuable time.',icon:faChartSimple},
 ];
 protected readonly benefits = [
 {name:'One Platform',copy:'All your team tools in one place.',icon:faUsers},
 {name:'Enterprise-Grade Security',copy:'Your data stays safe and private.',icon:faShieldHalved},
 {name:'Flexible for Your Business',copy:'Scale anytime, with no complexity.',icon:faLayerGroup},
 {name:'Save Time and Costs',copy:'Less tools, more productivity.',icon:faCoins},
 ];
 protected readonly contactStatus = signal('');
 protected prepareRequest(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const body = Array.from(data.entries()).map(([key,value]) => key + ': ' + String(value)).join('\n');
  window.location.href = 'mailto:info@worldposta.com?subject=CloudSpace%20demo%20request&body=' + encodeURIComponent(body);
  this.contactStatus.set('Your email app will open with your request. Send it to contact our team.');
 }
}



