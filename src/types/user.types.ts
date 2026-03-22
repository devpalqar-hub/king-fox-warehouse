export interface Role {
  id: number;
  name: string;
}

export interface Branch {
  id: number;
  name: string;
  phone: string;
  address: string;
  type: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  branch: Branch | null;
  createdAt: string;
}