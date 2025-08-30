'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSlackAlert } from '@/hooks/use-slack-alert';
import { toast } from 'sonner';


export function NotSupported({
  cloudProvider,
  framework,
  onBack,
  user,
  onTryVercel,
}: {
  cloudProvider: string;
  framework: string;
  onBack: () => void;
  user: any;
  onTryVercel: () => void;
}) {
  const { sendAlert, isLoading } = useSlackAlert();

  const handleNotifyMe = async () => {
    const result = await sendAlert(
      'Notify Me When Ready for ' + cloudProvider + ' + ' + framework,
      {
        email: user?.email ?? '',
        first_name: user?.firstName ?? '',
        last_name: user?.lastName ?? '',
        user_id: user?.id ?? '',
      }
    );

    if (result.success) {
      // Show success toast
      toast.success(
        `We'll notify you when ${cloudProvider} + ${framework} support is ready!`
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              {cloudProvider} + {framework} Support Coming Soon
            </h1>
            <p className="text-muted-foreground text-lg">
              We&apos;re working hard to bring support for your platform
              combination.
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-6">
                We&apos;ll notify you as soon as {cloudProvider} and {framework}{' '}
                integration becomes available. In the meantime, you can try our
                Next.js support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Choose Different Platform
                </Button>
                <Button
                  variant="default"
                  onClick={handleNotifyMe}
                  className="gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Notify Me When Ready'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vercel Integration Section */}
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">
                Meanwhile, Check Out Our Vercel Integration
              </h3>
              <p className="text-muted-foreground mb-6">
                Get started right away with our fully supported Vercel + Next.js
                integration. Perfect for testing Kubiks while we work on{' '}
                {cloudProvider} + {framework} support.
              </p>
              <Button variant="default" onClick={onTryVercel} className="gap-2">
                Try Vercel Integration
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
