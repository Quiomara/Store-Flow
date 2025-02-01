import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterElementComponent } from './register-element.component';

describe('RegisterElementComponent', () => {
  let component: RegisterElementComponent;
  let fixture: ComponentFixture<RegisterElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
