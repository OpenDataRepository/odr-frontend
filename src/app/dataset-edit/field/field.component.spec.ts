import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FieldComponent } from './field.component';

describe('FieldComponent', () => {
  let component: FieldComponent;
  let fixture: ComponentFixture<FieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldComponent ],
      providers: [],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ]
    }).compileComponents();

  }));

  it('should create', () => {
    fixture = TestBed.createComponent(FieldComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({name: new FormControl(), description: new FormControl()});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
