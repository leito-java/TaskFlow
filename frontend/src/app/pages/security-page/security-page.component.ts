import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { ApiErrorService } from '../../api-error.service';

/** Écran privé : le mot de passe courant est toujours demandé avant un changement. */
@Component({
  selector: 'app-security-page',
  imports: [ReactiveFormsModule],
  templateUrl: './security-page.component.html',
  styleUrl: './security-page.component.css',
})
export class SecurityPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly apiErrors = inject(ApiErrorService);
  protected readonly saving = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  protected submit(): void {
    this.message.set(null); this.error.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.controls.newPassword.value !== this.form.controls.confirmPassword.value) {
      this.error.set('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    this.saving.set(true);
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => { this.form.reset(); this.message.set('Mot de passe modifié avec succès.'); },
      error: (response: unknown) => {
        this.saving.set(false);
        this.error.set(this.apiErrors.message(response, 'Modification impossible. Vérifiez votre mot de passe actuel.'));
      },
      complete: () => this.saving.set(false),
    });
  }
}
