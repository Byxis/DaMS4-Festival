import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { PublisherService } from '@publisher/publisher.service';

export const publisherResolver: ResolveFn<number> = async (route) => {
  const publisherService = inject(PublisherService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  while (publisherService.isLoading()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (publisherService.isError()) {
    router.navigate(['/not-found']);
    throw new Error('Error loading publishers');
  }

  let publisher = publisherService._publishers().find((p) => p.id === id);
  if (!publisher) {
    router.navigate(['/not-found']);
    throw new Error('Publisher not found');
  }

  return id;
};
