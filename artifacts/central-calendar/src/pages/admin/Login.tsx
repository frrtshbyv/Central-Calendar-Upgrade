import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminLogin, useAdminMe, getAdminMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const login = useAdminLogin();
  const { data: me, isLoading: checkingAuth } = useAdminMe();
  
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (me?.authenticated) {
      setLocation("/control-room-7f92x/events");
    }
  }, [me, setLocation]);

  // Lockout timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      timer = setTimeout(() => setLockoutTimer(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [lockoutTimer]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (lockoutTimer > 0) return;

    login.mutate({ data: values }, {
      onSuccess: (res) => {
        if (res.success) {
          toast({ title: "Authentication successful", description: "Accessing control room..." });
          // Update the cache immediately so ProtectedAdminRoute sees authenticated=true
          // before the background refetch completes, preventing a stale-cache bounce
          queryClient.setQueryData(getAdminMeQueryKey(), { authenticated: true, email: values.email });
          setLocation("/control-room-7f92x/events");
        } else {
          handleFailedAttempt();
        }
      },
      onError: () => {
        handleFailedAttempt();
      }
    });
  }

  const handleFailedAttempt = () => {
    toast({ 
      variant: "destructive", 
      title: "Authentication failed", 
      description: "Invalid credentials." 
    });
    
    setAttemptCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setLockoutTimer(5); // 5 second lockout after 3 failed attempts
      }
      return newCount;
    });
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-mono text-zinc-300">
      <div className="w-full max-w-md">
        
        <div className="mb-12 text-center">
          <ShieldCheck className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold tracking-widest text-zinc-100 uppercase">System Authentication</h1>
          <p className="text-xs text-zinc-600 mt-2">RESTRICTED ACCESS ONLY</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm shadow-2xl relative overflow-hidden">
          
          {/* Decorative scanner line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-[scan_3s_ease-in-out_infinite]" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-zinc-500 uppercase tracking-widest">Admin Identifier</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="operator@centralcalendar.org" 
                        {...field} 
                        className="bg-zinc-950 border-zinc-800 text-zinc-200 focus-visible:ring-emerald-500/30 font-mono rounded-sm h-12"
                        autoComplete="off"
                        disabled={lockoutTimer > 0 || login.isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-zinc-500 uppercase tracking-widest">Passphrase</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••••••" 
                        {...field} 
                        className="bg-zinc-950 border-zinc-800 text-zinc-200 focus-visible:ring-emerald-500/30 font-mono tracking-widest rounded-sm h-12"
                        autoComplete="off"
                        disabled={lockoutTimer > 0 || login.isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500 text-xs" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono rounded-sm h-12 transition-all disabled:opacity-50"
                disabled={lockoutTimer > 0 || login.isPending}
              >
                {login.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> VERIFYING...</>
                ) : lockoutTimer > 0 ? (
                  `SYSTEM LOCKED (${lockoutTimer}s)`
                ) : (
                  "AUTHENTICATE"
                )}
              </Button>
            </form>
          </Form>

          {attemptCount > 0 && attemptCount < 3 && (
            <div className="mt-4 text-center text-xs text-rose-500/70">
              Failed attempts: {attemptCount}/3
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-[10px] text-zinc-700 tracking-widest uppercase">
          Central Calendar Control Room v1.0.4
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
