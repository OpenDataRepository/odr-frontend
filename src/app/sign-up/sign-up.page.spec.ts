import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../auth.service';

import { SignUpPage } from './sign-up.page';
import { Component } from '@angular/core';

describe('SignUpPage', () => {
  let component: SignUpPage;
  let fixture: ComponentFixture<SignUpPage>;

  class MockAuthService {
  }

  @Component({
    selector: 'app-header',
    template: '<p>Mock App header</p>'
  })
  class MockAppHeader {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SignUpPage,
        MockAppHeader
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ],
      imports: [IonicModule.forRoot(), FormsModule]
    }).compileComponents();
    TestBed.inject(AuthService);

    fixture = TestBed.createComponent(SignUpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
