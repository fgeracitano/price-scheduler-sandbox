import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelSchedule, createSchedule, fetchSchedules } from '@/api/schedules';

export const scheduleKeys = {
  all: ['schedules'] as const,
  list: () => [...scheduleKeys.all, 'list'] as const,
  forProduct: (productId: string) => [...scheduleKeys.all, 'product', productId] as const,
};

export function useSchedules() {
  return useQuery({ queryKey: scheduleKeys.list(), queryFn: () => fetchSchedules() });
}

export function useProductSchedules(productId: string) {
  return useQuery({
    queryKey: scheduleKeys.forProduct(productId),
    queryFn: () => fetchSchedules(productId),
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: (schedule) =>
      queryClient.invalidateQueries({ queryKey: scheduleKeys.forProduct(schedule.productId) }),
  });
}

export function useCancelSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  });
}
