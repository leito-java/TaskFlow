import { expect, test } from '@playwright/test';

test('un utilisateur organise et retrouve son travail', async ({ page }, testInfo) => {
  const uniqueSuffix = `${Date.now()}-${testInfo.workerIndex}`;
  const email = `e2e-${uniqueSuffix}@taskflow.local`;
  const password = 'TaskFlow-E2E-2026!';
  const projectName = `Projet E2E ${uniqueSuffix}`;
  const taskTitle = `Tâche E2E ${uniqueSuffix}`;

  await test.step('Créer un compte', async () => {
    await page.goto('/register');
    await page.getByLabel('Adresse e-mail').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: 'Créer mon compte' }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await page.getByRole('button', { name: 'Passer le guide', exact: true }).click();
  });

  await test.step('Créer un projet', async () => {
    await page.getByRole('link', { name: 'Projets' }).click();
    await page.getByLabel('Nom du projet').fill(projectName);
    await page.getByRole('button', { name: 'Créer le projet' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: projectName })).toBeVisible();
  });

  await test.step('Créer une tâche dans le projet', async () => {
    await page.getByRole('link', { name: 'Nouvelle tâche' }).click();
    await page.getByLabel('Titre de la tâche').fill(taskTitle);
    await page.getByLabel('Description').fill('Parcours critique automatisé avec Playwright');
    await page.getByLabel('Niveau de priorité').selectOption('high');
    await page.getByLabel('Durée estimée').fill('45');
    await page.getByLabel('Projet').selectOption({ label: projectName });
    await page.getByRole('button', { name: 'Ajouter la tâche' }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByRole('article').filter({ hasText: taskTitle })).toBeVisible();
  });

  await test.step('Ajouter la tâche au focus et la terminer', async () => {
    await page.getByRole('button', { name: taskTitle, exact: true }).click();
    const dailyFocus = page.getByRole('region', { name: 'Mes priorités du jour' });
    await expect(dailyFocus).toContainText(taskTitle);
    await expect(dailyFocus).toContainText('Charge prévue : 45 min');

    const taskCard = page.getByRole('article').filter({ hasText: taskTitle });
    await taskCard.getByRole('checkbox', { name: 'Marquer la tâche comme terminée' }).check();
    await expect(taskCard).toContainText('Terminée');
  });

  await test.step('Se reconnecter et retrouver les données', async () => {
    await page.getByRole('button', { name: 'Déconnexion' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.getByLabel('Adresse e-mail').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByRole('article').filter({ hasText: taskTitle })).toContainText('Terminée');
    await page.getByRole('link', { name: 'Projets' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: projectName })).toBeVisible();
  });
});
