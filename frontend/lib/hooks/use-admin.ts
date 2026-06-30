"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import type {
  AuditLogOut,
  DepartmentOut,
  MemberOut,
  PermissionOut,
  ProjectOut,
  TeamMemberOut,
  TeamOut,
} from "@/lib/types";

export function useDepartments() {
  const api = useApi();
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<DepartmentOut[]>("/departments"),
  });
}

export function useCreateDepartment() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      api.post<DepartmentOut>("/departments", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departmentId: string) => api.delete(`/departments/${departmentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useMembers() {
  const api = useApi();
  return useQuery({ queryKey: ["members"], queryFn: () => api.get<MemberOut[]>("/members") });
}

export function useTeams() {
  const api = useApi();
  return useQuery({ queryKey: ["teams"], queryFn: () => api.get<TeamOut[]>("/teams") });
}

export function useTeamMembers(teamId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: () => api.get<TeamMemberOut[]>(`/teams/${teamId}/members`),
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; department_id?: string | null }) =>
      api.post<TeamOut>("/teams", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useDeleteTeam() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => api.delete(`/teams/${teamId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useAddTeamMember(teamId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { user_id: string; role?: string }) =>
      api.post<TeamMemberOut>(`/teams/${teamId}/members`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] }),
  });
}

export function useProjects() {
  const api = useApi();
  return useQuery({ queryKey: ["projects"], queryFn: () => api.get<ProjectOut[]>("/projects") });
}

export function useCreateProject() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; team_id?: string | null }) =>
      api.post<ProjectOut>("/projects", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => api.delete(`/projects/${projectId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function usePermissions(resourceType: string, resourceId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["permissions", resourceType, resourceId],
    queryFn: () =>
      api.get<PermissionOut[]>(
        `/permissions?resource_type=${resourceType}&resource_id=${resourceId}`
      ),
    enabled: !!resourceId,
  });
}

export function useGrantPermission() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      subject_type: string;
      subject_id: string;
      resource_type: string;
      resource_id: string;
      role: string;
    }) => api.post<PermissionOut>("/permissions", body),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["permissions", variables.resource_type, variables.resource_id],
      }),
  });
}

export function useRevokePermission() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) => api.delete(`/permissions/${permissionId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });
}

export function useAuditLogs() {
  const api = useApi();
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => api.get<AuditLogOut[]>("/audit-logs"),
  });
}
