import { Component, inject } from '@angular/core';
import { OnboardingService } from '../onboarding.service';

@Component({ selector: 'app-onboarding', templateUrl: './onboarding.component.html', styleUrl: './onboarding.component.css' })
export class OnboardingComponent { protected readonly onboarding = inject(OnboardingService); }
