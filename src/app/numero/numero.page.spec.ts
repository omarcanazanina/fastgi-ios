import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumeroPage } from './numero.page';

describe('NumeroPage', () => {
  let component: NumeroPage;
  let fixture: ComponentFixture<NumeroPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumeroPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumeroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
