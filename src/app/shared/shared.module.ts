import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BypassDomSanitizerPipe } from './bypass-dom-sanitizer.pipe';



@NgModule({
  declarations: [BypassDomSanitizerPipe],
  imports: [
    CommonModule
  ],
  exports: [BypassDomSanitizerPipe]
})
export class SharedModule { }
