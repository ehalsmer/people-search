import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthEmailVerifiedComponent } from './auth-email-verified.component';

describe('AuthEmailVerifiedComponent', () => {
  let component: AuthEmailVerifiedComponent;
  let fixture: ComponentFixture<AuthEmailVerifiedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthEmailVerifiedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthEmailVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
