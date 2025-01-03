import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorRequestComponent } from './instructor-request.component';

describe('InstructorRequestComponent', () => {
  let component: InstructorRequestComponent;
  let fixture: ComponentFixture<InstructorRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
