import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth.service';

import { HomePage } from './home.page';
import { Component } from '@angular/core';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  class MockApiService{}

  class MockAuthService {
    userIsAuthenticated = of(false);
    autoLogin = () => {return of(false)}
  }

  @Component({
    selector: 'app-header',
    template: '<p>Mock App header</p>'
  })
  class MockAppHeader {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        HomePage,
        MockAppHeader
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ApiService, useClass: MockApiService }
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
