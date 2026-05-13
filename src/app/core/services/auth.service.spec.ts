// =============================================
// FICHIER: src/app/core/services/auth.service.spec.ts
// Description: Tests unitaires pour AuthService (Vitest)
// =============================================

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService, User } from './auth.service';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    username: 'admin',
    email: 'admin@pharmacie.ma',
    password: 'admin123',
    role: 'admin',
    nom: 'Admin'
  };

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();

  beforeEach(() => {
    // Remplacer localStorage par le mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    localStorageMock.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} }])
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorageMock.clear();
  });

  // ─── Test 1: Service créé ─────────────────────────
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── Test 2: État initial ─────────────────────────
  it('should have isLoggedIn = false initially', () => {
    expect(service.isLoggedIn()).toBeFalsy();
  });

  it('should have currentUser = null initially', () => {
    expect(service.getUser()).toBeNull();
  });

  // ─── Test 3: Login réussi ─────────────────────────
  it('should login successfully and update signals', () => {
    service.login('admin@pharmacie.ma', 'admin123').subscribe(users => {
      expect(users.length).toBe(1);
      expect(service.isLoggedIn()).toBeTruthy();
      expect(service.getUser()?.email).toBe('admin@pharmacie.ma');
    });

    const req = httpMock.expectOne(req => req.url.includes('/users'));
    expect(req.request.method).toBe('GET');
    req.flush([mockUser]);
  });

  // ─── Test 4: Login échoué ─────────────────────────
  it('should not login with wrong credentials', () => {
    service.login('wrong@email.com', 'wrongpass').subscribe(users => {
      expect(users.length).toBe(0);
      expect(service.isLoggedIn()).toBeFalsy();
    });

    const req = httpMock.expectOne(req => req.url.includes('/users'));
    req.flush([]);
  });

  // ─── Test 5: Logout ───────────────────────────────
  it('should logout and clear signals', () => {
    localStorageMock.setItem('pharma_user', JSON.stringify(mockUser));
    service.logout();
    expect(service.isLoggedIn()).toBeFalsy();
    expect(service.getUser()).toBeNull();
    expect(localStorageMock.getItem('pharma_user')).toBeNull();
  });

  // ─── Test 6: userDisplayName ─────────────────────
  it('should compute userDisplayName', () => {
    localStorageMock.setItem('pharma_user', JSON.stringify(mockUser));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} }])
      ]
    });
    const freshService = TestBed.inject(AuthService);
    expect(freshService.userDisplayName()).toBe('Admin');
  });

  // ─── Test 7: isAdmin ─────────────────────────────
  it('should return true for admin role', () => {
    localStorageMock.setItem('pharma_user', JSON.stringify(mockUser));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} }])
      ]
    });
    const freshService = TestBed.inject(AuthService);
    expect(freshService.isAdmin()).toBeTruthy();
  });

  // ─── Test 8: Session persistante ─────────────────
  it('should restore session from localStorage', () => {
    localStorageMock.setItem('pharma_user', JSON.stringify(mockUser));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} }])
      ]
    });
    const freshService = TestBed.inject(AuthService);
    expect(freshService.isLoggedIn()).toBeTruthy();
    expect(freshService.getUser()?.email).toBe('admin@pharmacie.ma');
  });
});