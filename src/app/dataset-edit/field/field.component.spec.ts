import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FieldComponent } from './field.component';
import { PermissionService } from 'src/app/api/permission.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('FieldComponent', () => {
  let component: FieldComponent;
  let fixture: ComponentFixture<FieldComponent>;
  let debugElement: DebugElement;

  class PermissionServiceMock {
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldComponent ],
      providers: [
        { provide: PermissionService, useClass: PermissionServiceMock }
      ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ]
    }).compileComponents();

  }));

  it('should create', () => {
    fixture = TestBed.createComponent(FieldComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({name: new FormControl(), description: new FormControl(), type: new FormControl()});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('if not created yet, should still be able to edit', () => {
    fixture = TestBed.createComponent(FieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement.nativeElement;
    component.form = new FormGroup({name: new FormControl(), description: new FormControl(), type: new FormControl()});
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.may_edit).toBe(true);
    // var nameInput = document.querySelector("ion-input[formControlName='name']") as HTMLInputElement;
    // expect(nameInput).toBeTruthy();
    // console.log(nameInput);
    // expect(nameInput['readonly']).toBe(false);

  });
});
