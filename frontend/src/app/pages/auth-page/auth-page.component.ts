import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
})
export class AuthPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly isRegistration = computed(() => this.route.snapshot.routeConfig?.path === 'register');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true); this.error.set(null);
    const request = this.isRegistration() ? this.auth.register(this.form.getRawValue()) : this.auth.login(this.form.getRawValue());
    request.subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: (response: unknown) => {
        this.submitting.set(false);
        const httpError = response as { status?: number; error?: { detail?: unknown } };
        const detail = httpError.error?.detail;
        this.error.set(
          typeof detail === 'string'
            ? detail
            : `Connexion impossible (code HTTP ${httpError.status ?? 'inconnu'}).`,
        );
      },
      complete: () => this.submitting.set(false),
    });
  }
}
