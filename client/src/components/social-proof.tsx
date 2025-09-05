export default function SocialProof() {
  return (
    <section className="py-20 bg-muted" data-testid="section-social-proof">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-social-proof-title">
            Trusted by Leading Developers Across Canada
          </h2>
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-xl md:text-2xl text-muted-foreground italic mb-6" data-testid="text-testimonial">
              "ILLÜMMAA delivered 150 units on time and 15% under budget. Their industrial approach transformed our development timeline."
            </blockquote>
            <cite className="text-lg font-medium text-foreground" data-testid="text-testimonial-author">- Major Canadian Developer</cite>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto" data-testid="container-stats">
          <div className="text-center" data-testid="stat-units-delivered">
            <div className="text-4xl font-bold text-primary mb-2" data-testid="stat-number-units">500+</div>
            <div className="text-muted-foreground" data-testid="stat-label-units">Units Delivered</div>
          </div>
          <div className="text-center" data-testid="stat-provinces">
            <div className="text-4xl font-bold text-primary mb-2" data-testid="stat-number-provinces">12</div>
            <div className="text-muted-foreground" data-testid="stat-label-provinces">Provinces</div>
          </div>
          <div className="text-center" data-testid="stat-completion">
            <div className="text-4xl font-bold text-primary mb-2" data-testid="stat-number-completion">99%</div>
            <div className="text-muted-foreground" data-testid="stat-label-completion">On-Time Completion</div>
          </div>
        </div>
        
        {/* Developer Logos */}
        <div className="mt-16" data-testid="container-developer-logos">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="h-16 bg-white rounded-xl flex items-center justify-center" data-testid="logo-developer-a">
              <span className="text-gray-400 font-medium">Developer A</span>
            </div>
            <div className="h-16 bg-white rounded-xl flex items-center justify-center" data-testid="logo-developer-b">
              <span className="text-gray-400 font-medium">Developer B</span>
            </div>
            <div className="h-16 bg-white rounded-xl flex items-center justify-center" data-testid="logo-developer-c">
              <span className="text-gray-400 font-medium">Developer C</span>
            </div>
            <div className="h-16 bg-white rounded-xl flex items-center justify-center" data-testid="logo-developer-d">
              <span className="text-gray-400 font-medium">Developer D</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
