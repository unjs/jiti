type ImageType = {
  src: string;
  width: number;
  height: number;
};

interface User {
  name: string;
  avatar: string | ImageType;
}

interface NormalizedUser extends User {
  avatar: ImageType;
}

interface UserNormalizer {
  (user: User): NormalizedUser;
}

export const firstTest = {
  name: "first",
  avatar: "https://example.com/first.png",
} satisfies User;

export const secondTest = {
  name: "second",
  avatar: {
    src: "https://example.com/second.png",
    width: 100,
    height: 100,
  },
} satisfies User;

export const normalizeUserEntity = (({ name, avatar }: User) =>
  ({
    name,
    avatar: {
      src: typeof avatar === "string" ? avatar : avatar.src,
      width: 100,
      height: 100,
    },
  } satisfies NormalizedUser)) satisfies UserNormalizer;

export const test = () => {
  return {
    satisfiesTest: {
      firstTest,
      secondTest,
      normalizeUserEntity,
    },
  };
};
