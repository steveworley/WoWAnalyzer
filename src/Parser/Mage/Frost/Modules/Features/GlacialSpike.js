import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class GlacialSpike extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  overcapped = 0;
  total = 0;

  on_initialized() {
	   this.active = this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
  }

  on_toPlayer_changebuffstack(event) {
    if(event.ability.guid === SPELLS.ICICLES_BUFF.id && event.newStacks > event.oldStacks) {
      this.total += 1;
    }
  }

  on_toPlayer_refreshbuff(event) {
    if(event.ability.guid === SPELLS.GLACIAL_SPIKE_BUFF.id) {
      this.overcapped += 1;
	  }
  }

  get glacialSpikedIcicles() {
    return this.total - this.overcapped;
  }

  get utilPercentage() {
    return (this.glacialSpikedIcicles / this.total) || 0;
  }

  get overcappedPercentage() {
    return (this.overcapped / this.total) || 0;
  }

  suggestions(when) {
    when(this.overcappedPercentage).isGreaterThan(0.05)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You overcapped on {formatPercentage(this.overcappedPercentage, 1)}% of gained <SpellLink id={SPELLS.ICICLES_BUFF.id}/>. Casting Frostbolt at max Icicles will cause an Icicle to automatically launch. While this Icicle still does damage, there is an opportunity cost to delaying your Glacial Spike cast. You should try to cast <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id}/> as soon as you reach 5 icicles. Overcapping some <SpellLink id={SPELLS.ICICLES_BUFF.id}/> is unavoidable due to <SpellLink id={SPELLS.ICE_NINE.id}/>, but you should try and keep this number as low as possible.</span>)
          .icon(SPELLS.GLACIAL_SPIKE_TALENT.icon)
          .actual(`${formatPercentage(this.overcappedPercentage, 1)}% overcapped`)
          .recommended(`<${formatPercentage(recommended, 1)}% is recommended`)
          .regular(0.10).major(0.15);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GLACIAL_SPIKE_TALENT.id} />}
        value={`${formatPercentage(this.utilPercentage, 0)} %`}
        label="Icicle Utilization"
        tooltip={`This is the percentage of Icicles gained that you merged into a Glacial Spike. Casting Frostbolt at max Icicles will cause an Icicle to automatically launch. While this Icicle still does damage, there is an opportunity cost to delaying your Glacial Spike cast.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default GlacialSpike;
