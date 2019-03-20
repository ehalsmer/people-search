import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthAccessDeniedComponent } from './auth-access-denied.component';

describe('AuthAccessDeniedComponent', () => {
  let component: AuthAccessDeniedComponent;
  let fixture: ComponentFixture<AuthAccessDeniedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthAccessDeniedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthAccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
