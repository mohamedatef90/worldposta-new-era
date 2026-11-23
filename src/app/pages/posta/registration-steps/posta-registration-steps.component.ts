import {Component, signal} from '@angular/core';
@Component({selector:'app-posta-registration-steps',templateUrl:'./posta-registration-steps.component.html',styleUrl:'./posta-registration-steps.component.css'})
export class PostaRegistrationSteps {
protected readonly active=signal(0);
protected readonly paused=signal(false);
protected readonly focused=signal(false);
protected readonly steps=[{title:'Create your account',description:'Enter your business details in the WorldPosta registration panel.'},{title:'Verify your email',description:'Confirm your email address to activate your account.'},{title:'Set up your mailbox',description:'Add your domain and follow the setup steps for your business email.'}];
protected next():void{if(!this.paused()&&!this.focused())this.active.update(value=>(value+1)%3);}
protected onFocusOut(event:FocusEvent):void{const container=event.currentTarget as HTMLElement; if(!container.contains(event.relatedTarget as Node|null))this.focused.set(false);}
}