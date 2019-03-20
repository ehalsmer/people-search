import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthVerifyEmailComponent } from './auth-verify-email.component';

describe('AuthVerifyEmailComponent', () => {
  let component: AuthVerifyEmailComponent;
  let fixture: ComponentFixture<AuthVerifyEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthVerifyEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthVerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
