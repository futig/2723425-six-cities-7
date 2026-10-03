export const UserTypes = ['regular', 'pro'] as const;
export type UserType = typeof UserTypes[number];

export function isUserType(userType: string): UserType | undefined {
  return UserTypes.find((el) => el === userType);
}
