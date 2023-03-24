import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatasetService } from 'src/app/api/dataset.service';

import { DatasetComponent } from './dataset.component';

describe('DatasetEditComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;

  class FormBuilderMock {
  }

  class DatasetServiceMock {
  }


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetComponent ],
      providers: [
        DatasetComponent,
        { provide: FormBuilder, useClass: FormBuilderMock },
        { provide: DatasetService, useClass: DatasetServiceMock },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
