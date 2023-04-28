import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { AuthService } from '../auth.service';

import { HeaderComponent } from './header.component';
import { Router } from '@angular/router';

export const WINDOW = new InjectionToken('window');

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  class MockAuthService {
    userIsAuthenticated = of(false);
    logout = () => {};
  }

  const windowMock = {
    location: {
      reload: jasmine.createSpy('reload')
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        {provide: WINDOW, useValue: windowMock}
      ],
      imports: [IonicModule.forRoot(), RouterTestingModule.withRoutes([{ path: 'home', component: HeaderComponent }]),]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // describe('sign out', () => {
  //   it('should refresh the screen if sign out is from the home page', () => {
  //     // How to do this? I reckeon I would need more than just the header component. If I want to test that the home component
  //     // renders correctly, I would also need to at the very least load that page. But this test is so beyond what I know how to do
  //     router.navigate(['/home']);
  //     const navigateSpy = spyOn(router, 'navigateByUrl');
  //     component.signOut();
  //     expect(navigateSpy).not.toHaveBeenCalled();
  //     expect(windowMock.location.reload).toHaveBeenCalled();
  //   })
  // })
});
