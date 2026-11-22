
export interface RegisterInput {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;

  nik: string;
  rt_id: number;
  birth_place: string;
  birth_date: string;
  gender: "laki-laki" | "perempuan";
  address_detail: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: string;
}
