'use client';

import { useState, useEffect } from 'react';

interface CreditsDisplayProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function CreditsDisplay({ variant = 'compact', className = '' }: CreditsDisplayProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/ai-models');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.userCredits);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        {variant === 'compact' ? (
          <div className="text-sm text-muted-foreground">
            Credits: <span className="font-bold text-foreground">...</span>
          </div>
        ) : (
          <p className="text-muted-foreground">Loading credits...</p>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={className}>
        <div className="text-sm text-muted-foreground">
          Credits: <span className="font-bold text-foreground">{credits ?? 0}</span>
        </div>
      </div>
    );
  }

  return (
    <p className={`text-muted-foreground ${className}`}>
      You have {credits ?? 0} credits remaining.
    </p>
  );
}
