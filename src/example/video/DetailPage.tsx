import * as React from 'react';
import { DetailLayout } from '../../layout/DetailLayout';
import { MoreLikeThis } from '../../component/MoreLikeThis';
import { SearchBox } from '../../component/SearchBox';
import { DataStore, SolrCore, SolrGet, SolrMoreLikeThis, SolrQuery } from '../../context/DataStore';
import { databind } from '../../context/DataBinding';

interface Talk {
  id: string;
  title_s: string;
  url_s: string;
}

class VideoPlayer extends React.Component<Talk, {}> {
  youtubeId(url: String) {
    return url.replace(/.*v=/, '');
  }

  render() {
    const url = this.props.url_s;

    const ytUrl: string | undefined = 
      url ? (
        'https://www.youtube.com/embed/' + this.youtubeId(url) 
        + '?modestbranding=true'
      ) : undefined;
    
    return (
      <div>
        <iframe 
          id="player" 
          width="100%"
          height="390"
          src={ytUrl} 
        />
        <h2>
          {this.props.title_s}
        </h2>
      </div>
    );
  }
}

interface Talk {
  title_s: string;
  id: string;
  url: string;
}

// Ideally you want to write code like this:
// 
//  DataStore.books.get = (talk: Talk) => <Detail {...talk} />
//  bind(onClick, (e) => DataStore.books.get(e.target.value))
//
//  Which would suggest that...
//    We need a different type T for each core
//    get needs to be a property?
type TalkCoreCapabilities = SolrCore<Talk> & SolrGet<Talk> & SolrMoreLikeThis<Talk> & SolrQuery<Talk>;
class TalkSearchDataStore extends DataStore {
  private talksCore: TalkCoreCapabilities;

  constructor() {
    super();
  }

  // Every core should have it's own function
  // registered in your datastore
  //
  // If you want to have some UI controls use
  // different subsets of the data in the index
  // you should register one entry per use case.
  get talks(): TalkCoreCapabilities {
    if (!this.talksCore) {
      this.talksCore = super.registerCore({
        url: 'http://40.87.64.225:8983/solr/',
        core: 'talks',
        primaryKey: 'id',
        // Unfortunately these have to be repeated 
        // since there is no apparent way to sync
        // this with Typescript
        fields: ['title_s', 'url_s', 'id'],
      });
    }

    return this.talksCore;
  }
}

function ytId(url: string) {
  return url.split('v=')[1].split('&')[0];
}

const suggestions = [
  '.net', '14th amendment', '1984', '2016', '2017', '3d', 'a', 'abraham lincoln', 
  'abuse', 'accounting', 'adhd', 'advertising', 'aesthetics', 'african', 'agent', 
  'agile', 'agriculture', 'ai', 'akka', 'alan watts', 'algebra', 'algorithm', 'algorithms', 
  'amazon', 'analytics', 'anatomy', 'android', 'angular', 'angular 2', 'animation', 'ansible', 
  'anthropology', 'arabic', 'archaeology', 'architecture', 'arduino', 'art', 'artificial intelligence', 
  'astronomy', 'attention', 'autism', 'aviation', 'aws', 'bankruptcy', 'bash', 'battleship', 'bayes', 
  'bayesian', 'beatles', 'beer', 'big data', 'bim', 'biochemistry', 'bioethics', 'biology', 'bipolar', 
  'bitcoin', 'blockchain', 'borderline', 'boundaries', 'brain', 'buddhism', 'business', 'business 101', 
  'business intelligence', 'business strategy', 'c', 'c programming', 'calculus', 'cancer', 'cave art', 
  'chef', 'chemical engineering', 'chemistry', 'china', 'chomsky', 'cisco', 'civil engineering', 
  'civil war', 'clojure', 'cloud', 'cloud computing', 'comedy', 'communication', 'computer', 
  'computer science', 'computer vision', 'consciousness', 'construction', 'contract law u.k.', 'copyright', 
  'craft beer', 'creative processes', 'creative writing', 'criminal justice', 'cryptography', 
  'customer engagement', 'cyber security', 'cybersecurity', 'data', 'data mining', 'data science', 
  'data structure', 'data structures', 'database', 'deap learning', 'deep learning', 'depression', 'design', 
  'design thinking', 'devops', 'diabetes', 'diet', 'digital', 'digital forensics', 'digital marketing', 
  'django', 'docker', 'domain driven design', 'draw', 'drawing', 'drupal', 'e-learning', 'ecology', 
  'econometrics', 'economics', 'elasticsearch', 'electrical', 'electronics', 'elixir', 'encryption', 
  'engineering', 'english', 'entrepreneur', 'entrepreneurship', 'environment', 'eric lippert', 'erlang',
  'ethics', 'excel', 'f', 'fashion', 'feynman', 'fiction', 'fiction politics', 'film', 'finance', 'fire', 
  'fluid mechanics', 'food', 'forensics', 'formal verification', 'french', 'functional', 'functional programming', 
  'game', 'game design', 'game theory', 'genealogy', 'geography', 'geology', 'german', 'gifs', 'git',
  'global security', 'gm food', 'go', 'goals', 'golang', 'google', 'google analytics', 'graphic design', 
  'graphics', 'guitar', 'gza', 'hacking', 'hadoop', 'hans rosling', 'haskell', 'health', 'heroin', 
  'hidden markov models', 'history', 'homotopy type theory', 'html', 'human behavior', 'human resources', 
  'india', 'information literacy', 'innovation', 'intangible asset valuation', 'international law', 
  'introduction to big data', 'investigative psychology', 'investing', 'investment', 'ios', 'islam', 'it',
  'it leadership', 'it security', 'italian', 'ivf', 'japan', 'japanese', 'java', 'java concurrency', 
  'java script', 'javascript', 'jazz', 'jenkins', 'journalism', 'julia evans', 'kafka', 'kant', 'kernel', 
  'kubernetes', 'lancashire', 'language', 'laravel', 'law', 'law family', 'ldap', 'leadership', 'learning', 
  'lexicography', 'library', 'linear algebra', 'linguistic', 'linguistics', 'linux', 'lisp', 'literature', 
  'liver function test', 'logic', 'machine learning', 'macroeconomics', 'management', 'marathon', 'marketing', 
  'mars', 'math', 'mathematics', 'matlab', 'maxwell equations', 'mcwhorter', 'medicine', 'meditation', 
  'memory forensics', 'microbiology', 'microservices', 'microwave', 'mindfulness', 'music', 'music theory', 
  'negotiation', 'network', 'networking', 'neural', 'neuro', 'neuroscience', 'nietzsche', 'node', 'node.js', 
  'nodejs', 'nootropics', 'nursing', 'nutrition', 'opengl', 'openstack', 'optics', 'oracle', 'oracle hcm', 
  'perl', 'personal developmemt', 'personality', 'pharmacology', 'pharmacy', 'philosophy', 'phonetics',
  'phonics primen', 'photography', 'photoshop', 'php', 'physics', 'physiology', 'plato', 'play therapy', 
  'poetry', 'politics', 'post keynesian', 'problem solving', 'procrastination', 'programming', 
  'project management', 'psych', 'psychiatry', 'psychology', 'psychotherapy', 'public speaking', 
  'puppet', 'python', 'python programming', 'python simulation', 'r', 'radiology', 'randall munroe', 
  'raspberry pi', 'react', 'real estate', 'realtime', 'redux', 'relativity', 'religion', 'robot', 'robotics',
  'roman', 'rome', 'ruby', 'russia', 'russian', 'sailing', 'sales', 'scala', 'science', 'scientific writing', 
  'scrum', 'sdn', 'security', 'seo', 'soccer', 'social media', 'social work', 'sociology', 'software', 
  'software testing', 'spanish', 'spark', 'spiro agnew', 'splunk', 'spoken english', 'sports', 'spring', 
  'spring boot', 'sql', 'sql server', 'startup', 'statistics', 'statutory interpretation', 'stereotypes', 
  'stock market forcast', 'storytelling', 'strategy', 'swift', 'tamil', 'teaching', 'tech', 'technical interview', 
  'technology', 'technology society', 'tensorflow', 'terrorism', 'test', 'testing', 'theatre', 'thermodynamics', 
  'topology', 'trans', 'transition zone', 'triz', 'trump', 'unity', 'ux', 'vagrant', 'vector calculus', 'verilog', 
  'virtual reality', 'visual basic', 'voice', 'vr', 'walt whitman', 'watercolor', 'waterloo', 'web', 
  'web development', 'web services', 'wine', 'wordpress', 'world war ii', 'writing', 'xamarin 2016', 'yoga', 'zen'];

interface DetailAppProps {
  id: string;
  load: (id: string) => void;
}

const dataStore: TalkSearchDataStore = new TalkSearchDataStore();

class DetailPageApp extends React.Component<DetailAppProps, {}> {
  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;

  constructor() {
    super();

    this.left = databind(
      dataStore.talks.onGet,
      dataStore.talks,
      (talk: Talk) => (<VideoPlayer {...talk} />)
    );

    this.right = databind(
      dataStore.talks.onMoreLikeThis,
      dataStore.talks,
      (talks: Talk[]) => (
        <MoreLikeThis 
          title="More Like This:"
          docs={talks} 
          render={
            (talk: Talk) => (
              talk.url_s.indexOf('youtube.com') > 0 ? (
                <div style={{height: '140px'}}>
                  <div style={{float: 'left', width: '50%'}}>
                    <a 
                      style={{paddingBottom: '10px', height: '12px'}}
                      href="#"
                      onClick={() => this.props.load(talk.id)}
                    >
                      <img 
                        height="120px"
                        src={'https://img.youtube.com/vi/' + ytId(talk.url_s) + '/mqdefault.jpg'} 
                        alt={talk.title_s}
                      />
                    </a>
                  </div>
                  <div 
                    style={{float: 'right', width: '50%', height: '120px'}}
                    onClick={() => this.props.load(talk.id)}
                  >
                    <b>{talk.title_s}</b>
                  </div>
                </div>
              ) : null
            )
          }
        />)
    );

    this.header = databind(
      dataStore.talks.onMoreLikeThis,
      dataStore.talks,
      (talk: Talk) => (
        <SearchBox 
          initialQuery="" 
          placeholder="Search..."
          onDoSearch={(query: String) => {
            location.href = 'https://www.findlectures.com/?q=' + query;
          }}
          loading={false}
          sampleSearches={suggestions}
        />
      )
    );
  }

  init() {
    dataStore.talks.doGet(this.props.id);
    dataStore.talks.doMoreLikeThis(this.props.id);
  }

  componentWillReceiveProps() {
    this.init();
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    dataStore.clearEvents();
  }

  render() { 
    return (
      <DetailLayout 
        leftComponent={this.left}
        rightComponent={this.right}
        headerComponent={this.header}
      />
    );
  }
}

export { DetailPageApp };