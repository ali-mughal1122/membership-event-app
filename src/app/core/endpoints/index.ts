import { AuthEndpoints, AuthEndpointsMapping } from './auth.endpoints';
import { EventsEndpoints, EventsEndpointsMapping } from './events.endpoints';
import { MembersEndpoints, MembersEndpointsMapping } from './members.endpoints';
import { PlansEndpoints, PlansEndpointsMapping } from './plans.endpoints';
import { ReviewsEndpoints, ReviewsEndpointsMapping } from './reviews.endpoints';
import { UsersEndpoints, UsersEndpointsMapping } from './users.endpoints';

export const AppEndpoints = [
  ...AuthEndpoints,
  ...EventsEndpoints,
  ...MembersEndpoints,
  ...PlansEndpoints,
  ...ReviewsEndpoints,
  ...UsersEndpoints,
];

export const AppEndpointsMapping = {
  ...AuthEndpointsMapping,
  ...EventsEndpointsMapping,
  ...MembersEndpointsMapping,
  ...PlansEndpointsMapping,
  ...ReviewsEndpointsMapping,
  ...UsersEndpointsMapping,
};
