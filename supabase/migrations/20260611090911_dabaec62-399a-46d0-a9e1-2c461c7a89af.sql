CREATE TABLE public.assistant_queued_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.assistant_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  text text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'queued',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX assistant_queued_messages_thread_idx ON public.assistant_queued_messages(thread_id, position, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_queued_messages TO authenticated;
GRANT ALL ON public.assistant_queued_messages TO service_role;

ALTER TABLE public.assistant_queued_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads queued" ON public.assistant_queued_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner inserts queued" ON public.assistant_queued_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.assistant_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()
  ));
CREATE POLICY "Owner updates queued" ON public.assistant_queued_messages
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner deletes queued" ON public.assistant_queued_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);