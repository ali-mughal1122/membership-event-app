import { AuthEndpoints, AuthEndpointsMapping } from './auth.endpoints';
import { EventsEndpoints, EventsEndpointsMapping } from './events.endpoints';
import { MembersEndpoints, MembersEndpointsMapping } from './members.endpoints';
import { PlansEndpoints, PlansEndpointsMapping } from './plans.endpoints';
import { ReviewsEndpoints, ReviewsEndpointsMapping } from './reviews.endpoints';
import { UsersEndpoints, UsersEndpointsMapping } from './users.endpoints';
import { CategoriesEndpoints, CategoriesEndpointsMapping } from './categories.endpoints';
import { SupportEndpoints, SupportEndpointsMapping } from './support.endpoints';

export const AppEndpoints = [
  ...AuthEndpoints,
  ...EventsEndpoints,
  ...MembersEndpoints,
  ...PlansEndpoints,
  ...ReviewsEndpoints,
  ...UsersEndpoints,
  ...CategoriesEndpoints,
  ...SupportEndpoints,
];

export const AppEndpointsMapping = {
  ...AuthEndpointsMapping,
  ...EventsEndpointsMapping,
  ...MembersEndpointsMapping,
  ...PlansEndpointsMapping,
  ...ReviewsEndpointsMapping,
  ...UsersEndpointsMapping,
  ...CategoriesEndpointsMapping,
  ...SupportEndpointsMapping,
};
