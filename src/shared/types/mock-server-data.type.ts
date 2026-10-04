export type MockUser = {
  name: string;
  email: string;
  avatarPath: string;
}

export type MockServerData = {
  titles: string[];
  descriptions: string[];
  previewImages: string[];
  images: string[];
  users: MockUser[];
}
